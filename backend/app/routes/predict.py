from fastapi import APIRouter,File,UploadFile
from PIL import Image , UnidentifiedImageError

from backend.app.utils.predict_utils import validateImageType
from models.dummy_model import dummy_model
model = dummy_model() # object of dummy model to use for prediction
from models.dummy_preprocess import dummy_preprocess
preprocess = dummy_preprocess() # object of dummy preprocess to use for preprocessing

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
    image = preprocess.preprocess(image)
    #use model to predict class and confidence
    prediction, confidence = model.predict(image)

    #return json with results from model
    return {"prediction" : prediction,"confidence":confidence} 
    