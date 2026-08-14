from fastapi import APIRouter

predict_router = APIRouter(prefix="/predict")

@predict_router.get("/")
def get():
    return {"method" : "get","health":"ok"}