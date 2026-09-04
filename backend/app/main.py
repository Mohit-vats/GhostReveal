from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routes.predict import predict_router

app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app.include_router(predict_router)

@app.get("/")
def root():
    return {"service": "GhostReveal API", "status": "running"}

@app.get("/health")
def check_health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000,reload=True)
