from fastapi import FastAPI
import uvicorn

from backend.app.routes.predict import predict_router

app = FastAPI()

app.include_router(predict_router)

@app.get("/health")
def check_health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000,reload=True)
