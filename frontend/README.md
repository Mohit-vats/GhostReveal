# GhostReveal — Frontend

React + Vite + Tailwind CSS v4 frontend for the GhostReveal AI-image detector.


## Getting started

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173` by default. The backend is expected at
`http://localhost:8000` 

## Project structure

```
src/
  components/
    Logo.jsx           - placeholder logo mark + wordmark (swap the <svg> for your real logo)
    ScanUploader.jsx    - drag/drop + click-to-browse image picker, scan-line animation while analyzing
  pages/
    Home.jsx            - upload screen
    Result.jsx          - verdict + confidence screen (reads data passed via router state)
  lib/
    api.js               - talks to POST /predict/, matches your FastAPI response shape exactly
  index.css               - Tailwind v4 theme tokens (colors, fonts) + scan-line keyframes
```

## How it connects with API

Request: `POST {VITE_API_BASE_URL}/predict/` as `multipart/form-data`, field name `img`
(matches `UploadFile = File(...)` param name in `predict.py`).

Expected success response: `{ "prediction": string, "confidence": number }`
Expected error response: `{ "error": string }` — shown inline under the upload box.

The result page color-codes the verdict green if `prediction` contains "real"
(case-insensitive) and red/orange otherwise — so it'll work correctly once your
teammates' real model returns "real image" instead of the dummy's hardcoded
"AI generated image".

## Design notes

- Palette: off-white paper background with a faint dot-grid, near-black ink text,
  one indigo accent, plus two semantic signal colors used only on the result
  screen (green = real, red-orange = AI-generated).
- Type: Space Grotesk for headings, Inter for body copy, JetBrains Mono for the
  confidence readout — a small "data/forensics" touch that fits the subject.
- Signature interaction: a horizontal scan-line sweeps over the uploaded image
  while the request is in flight, echoing the "revealing what's hidden" idea
  behind the product name. Respects `prefers-reduced-motion`.
- Swap the placeholder mark in `Logo.jsx` for your real logo file whenever it's ready.

## Next steps once real models land

Nothing in the frontend needs to change — the response shape is already what
your teammates' models will return. Just re-point `VITE_API_BASE_URL` if the
backend's deployed URL differs from local dev.
