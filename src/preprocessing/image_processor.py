import cv2
import numpy as np
from pathlib import Path
from typing import Tuple

TARGET_SIZE = (224, 224)
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


class ImageProcessor:
    def __init__(self, target_size=TARGET_SIZE):
        self.target_size = target_size

    def process(self, image_input):
        img_bgr = self._load(image_input)
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img_rgb, self.target_size, interpolation=cv2.INTER_AREA)
        img_float = img_resized.astype(np.float32) / 255.0
        img_norm = (img_float - MEAN) / STD
        img_chw = img_norm.transpose(2, 0, 1)
        return img_chw.astype(np.float32)

    def process_for_display(self, image_input):
        img_bgr = self._load(image_input)
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        return cv2.resize(img_rgb, self.target_size)

    def _load(self, image_input):
        if isinstance(image_input, (str, Path)):
            img = cv2.imread(str(image_input))
            if img is None:
                raise FileNotFoundError("Cannot read: " + str(image_input))
            return img
        elif isinstance(image_input, np.ndarray):
            return image_input.copy()
        else:
            raise TypeError("Unsupported type: " + str(type(image_input)))


def load_image_as_batch(image_path):
    processor = ImageProcessor()
    tensor = processor.process(image_path)
    return np.expand_dims(tensor, axis=0)
