from fastapi import APIRouter,File,UploadFile
from PIL import Image , UnidentifiedImageError

from utils.predict_utils import validateImageType

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
   
    #preprocess image 
    #use model to predict class and confidence
    #return json with results from model
    return {"prediction" : "AI generated image","confidence":0.9} 
    