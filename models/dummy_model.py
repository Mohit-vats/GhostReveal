import random

class dummy_model:
    def predict(self,image):
        #dummy model to return class and confidence
        return "AI generated image",random.uniform(0.5,1.0)