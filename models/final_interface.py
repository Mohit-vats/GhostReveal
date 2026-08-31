import numpy as np
import tensorflow as tf
from PIL import Image
import json
import os

IMG_SIZE = 300
# grad_cam_model = tf.keras.models.load_model("models/final_model_defactify/config.json")
model_dir = "models/final_model_defactify"

def load_model():
    with open(f"{model_dir}/config.json", "r") as f:
        config = json.load(f)

    grad_cam_model = tf.keras.models.model_from_json(
        json.dumps(config)
    )

    # Load trained weights
    grad_cam_model.load_weights(
        f"{model_dir}/model.weights.h5"
    )

    return grad_cam_model

def preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.convert("RGB")
    image = image.resize((IMG_SIZE, IMG_SIZE))

    arr = np.asarray(image, dtype=np.float32)          # (IMG_SIZE, IMG_SIZE, 3), [0,255]
    arr = np.expand_dims(arr, axis=0)                   # add batch dim
    arr = arr.astype(np.float32)          # match interpreter's expected dtype
    return arr

def find_submodel(model):
    """Find the nested backbone sub-model (e.g. EfficientNetV2B3) inside
    the outer classification model."""
    for layer in model.layers:
        if isinstance(layer, tf.keras.Model):
            return layer
    raise ValueError("No nested sub-model (backbone) found inside grad_cam_model.")

def find_last_conv_layer(model):
    """Find the last conv-like (4D output) layer, recursing into nested models."""
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.Model):
            try:
                return find_last_conv_layer(layer)
            except ValueError:
                continue
        if len(layer.output.shape) == 4:  # (batch, H, W, channels)
            return layer.name
    raise ValueError("No 4D conv-like layer found.")

def make_gradcam_heatmap(image_array,model):
    """image_array: output of preprocess_image() -- (1, IMG_SIZE, IMG_SIZE, 3), [0,255]."""
    base_model = find_submodel(model)
    last_conv_layer_name = find_last_conv_layer(base_model)

    conv_layer_model = tf.keras.Model(
        base_model.input, base_model.get_layer(last_conv_layer_name).output
    )

    # Rebuild the head (GAP -> Dropout -> Dense) as a separate model so we
    # can run it on top of the conv output inside the same GradientTape.
    head_input = tf.keras.Input(shape=conv_layer_model.output.shape[1:])
    x = head_input
    for layer in model.layers:
        if isinstance(layer, tf.keras.Model) or isinstance(layer, tf.keras.layers.InputLayer):
            continue
        x = layer(x)
    head_model = tf.keras.Model(head_input, x)

    image_tensor = tf.convert_to_tensor(image_array, dtype=tf.float32)

    with tf.GradientTape() as tape:
        conv_output = conv_layer_model(image_tensor)
        tape.watch(conv_output)
        preds = head_model(conv_output)
        class_channel = preds[:, 0]  # sigmoid output, single unit

    grads = tape.gradient(class_channel, conv_output)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_output = conv_output[0]
    heatmap = conv_output @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / (tf.reduce_max(heatmap) + 1e-8)
    return heatmap.numpy(), float(preds[0, 0])

def predict(image: Image.Image,model , alpha=0.4):
    """Takes a raw PIL image, runs preprocessing + Grad-CAM, shows the overlay."""
    image_array = preprocess_image(image)          # reuse the same preprocessing as deployment
    image_array = image_array.astype(np.float32)    # ensure float32 for the gradient model

    heatmap, prob = make_gradcam_heatmap(image_array,model)

    heatmap_resized = tf.image.resize(heatmap[..., tf.newaxis], [IMG_SIZE, IMG_SIZE]).numpy().squeeze()
    r = np.clip(1.5 - np.abs(4 * heatmap_resized - 3), 0, 1)
    g = np.clip(1.5 - np.abs(4 * heatmap_resized - 2), 0, 1)
    b = np.clip(1.5 - np.abs(4 * heatmap_resized - 1), 0, 1)
    
    heatmap_colored = np.stack([r, g, b], axis=-1)

    orig = image_array[0] / 255.0
    overlay = orig * (1 - alpha) + heatmap_colored * alpha
    pil_overlay = np.clip(overlay * 255, 0, 255).astype(np.uint8)
    pil_overlay = Image.fromarray(pil_overlay)
    
    label = "AI Generated Image" if prob > 0.5 else "Real Image"
    confidence = prob if prob > 0.5 else 1 - prob
    print( label , confidence )
    print(type(pil_overlay))

    return label,confidence,pil_overlay