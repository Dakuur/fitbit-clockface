from PIL import Image
import os

def resize_and_crop(image_path, output_path, size=(300, 300)):
    with Image.open(image_path) as img:
        # Calcular la relación de aspecto de la imagen
        img_ratio = img.width / img.height
        target_ratio = size[0] / size[1]
        
        if img_ratio > target_ratio:
            # La imagen es más ancha que el objetivo: recortar los lados
            new_height = img.height
            new_width = int(target_ratio * new_height)
            offset = (img.width - new_width) // 2
            crop_box = (offset, 0, offset + new_width, new_height)
        else:
            # La imagen es más alta que el objetivo: recortar solo por abajo
            new_width = img.width
            new_height = int(new_width / target_ratio)
            crop_box = (0, 0, new_width, new_height)  # Recortar desde arriba (0,0) hasta el nuevo alto

        img_cropped = img.crop(crop_box)
        img_resized = img_cropped.resize(size, Image.LANCZOS)
        
        img_resized.save(output_path)

def process_folder(input_folder, output_folder):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    for filename in os.listdir(input_folder):
        if filename.endswith(".jpg") or filename.endswith(".jpeg"):
            image_path = os.path.join(input_folder, filename)
            output_path = os.path.join(output_folder, filename)
            resize_and_crop(image_path, output_path)

# Ejemplo de uso
input_folder = r"C:\Users\david\Downloads\fotos"
output_folder = r"C:\fitbit\schedule\resources\specials"
process_folder(input_folder, output_folder)