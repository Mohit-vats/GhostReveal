# GhostReveal 

**See through the pixels.** GhostReveal is an AI-generated image detection system. Upload a photo and it tells you whether the image is real or AI-generated, with a confidence score and a Grad-CAM heatmap showing *which* regions of the image drove the model's decision.

## How it works

1. You drag/drop or select an image in the web app.
2. The image is sent to a FastAPI backend, which feeds it through a fine-tuned **EfficientNetV2-B3** binary classifier (Keras 3 / TensorFlow).
3. The backend runs **Grad-CAM** on the model's last convolutional layer to generate a heatmap overlay, then returns the verdict, a confidence score, and the heatmap image.
4. The frontend shows a "REAL IMAGE" / "AI GENERATED" verdict with the confidence percentage, and lets you toggle the Grad-CAM overlay on top of your upload.

## Tech stack

| Layer    | Stack |
|----------|-------|
| Frontend | React 19, Vite, React Router, Tailwind CSS v4 |
| Backend  | FastAPI, Uvicorn, Pillow |
| Model    | TensorFlow / Keras 3, EfficientNetV2-B3 backbone, Grad-CAM explainability |

## Project structure

```
GhostReveal/
├── backend/
│   └── app/
│       ├── main.py              # FastAPI app entrypoint, CORS, /health route
│       ├── routes/predict.py    # POST /predict/ — runs inference, returns JSON
│       └── utils/predict_utils.py
├── frontend/
│   ├── src/
│   │   ├── pages/Home.jsx       # Upload screen
│   │   ├── pages/Result.jsx     # Verdict + confidence + Grad-CAM toggle
│   │   ├── components/ScanUploader.jsx
│   │   └── lib/api.js           # Talks to the backend
│   └── package.json
├── models/
│   ├── final_interface.py       # Model loading, preprocessing, Grad-CAM, predict()
│   └── final_model_defactify/   # Trained weights (config.json + model.weights.h5)
├── tests/                       # Sample images for manually exercising the pipeline
└── requirements.txt             # pip freeze — full backend + model environment
```

## Getting started

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend

```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

python -m backend.app.main
# or: uvicorn backend.app.main:app --reload
```

The API starts on `http://localhost:8000`. Run every command from the **repo root** — `requirements.txt` lives there, and `backend/app/main.py` imports via the `backend.app.*` package path, so it won't resolve if you `cd backend` first.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app starts on `http://localhost:5173` and expects the backend at `http://localhost:8000` (override with a `VITE_API_BASE_URL` env variable).

## API reference

### `GET /health`
Health check. Returns `{"status": "healthy"}`.

### `POST /predict/`
Analyzes an uploaded image.

- **Body:** `multipart/form-data` with a single field `img` (JPEG or PNG)
- **Success response:**
  ```json
  {
    "prediction": "AI Generated Image",
    "confidence": 0.9421,
    "grad_cam": "<base64-encoded PNG>"
  }
  ```
- **Error response:** `{"error": "..."}` (invalid or unreadable image)

## Model

The classifier lives in `models/final_model_defactify/` and is loaded via `models/final_interface.py`:

- **Backbone:** EfficientNetV2-B3, input size 300×300, single sigmoid output (real vs. AI-generated)
- **Explainability:** Grad-CAM is computed against the last 4D convolutional layer of the backbone, then blended over the original image as a red/green/blue heatmap overlay
- Weights and architecture are stored separately (`model.weights.h5` + `config.json`) rather than as a single bundled model file

## Roadmap / known gaps

- `requirements.txt` is a raw `pip freeze` from a Windows (MINGW64) environment, so it pins exact versions for everything installed there — if you're setting up on macOS/Linux, a package or two may need to be dropped or swapped manually
- No automated test suite yet; `tests/` currently holds sample images for manual checks against the `/predict/` endpoint
- No license file included yet

## Contributing

Issues and PRs are welcome — this is an early-stage project, so expect things to move fast.
