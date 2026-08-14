from PIL import Image
# print(Image) 

im = Image.open("pic.PNG")
atts = vars(im)
for k,v in atts.items():
    print(k , " : ",v)

im._size = (220,220)
im.show()