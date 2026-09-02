from fastapi import APIRouter,File,UploadFile
from PIL import Image , UnidentifiedImageError
import base64
from io import BytesIO

from backend.app.utils.predict_utils import validateImageType
from models.final_interface import load_model, preprocess_image, predict
model = load_model() # object of final model to use for prediction

predict_router = APIRouter(prefix="/predict")

@predict_router.get("/")
def get():
    # add frontend - image ,text input , submit button,check valid photo ...
    return {"method" : "get","health":"ok"}

@predict_router.post("/")
def post(img : UploadFile = File(...)):

    #read image 
    try :
        image = Image.open(img.file)
    except UnidentifiedImageError:
        return {"error" : "Unable to identify the image format."}
    #validate image format
    if not validateImageType(image):
        return {"error" : "Invalid image format. Only JPEG and PNG are supported."}
    
    prediction, confidence ,grad_cam = predict(image,model)

    #return json with results from model
    buffer = BytesIO()
    grad_cam.save(buffer, format="PNG")
    grad_cam_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return {"prediction": prediction, "confidence": confidence, "grad_cam": grad_cam_b64}
    