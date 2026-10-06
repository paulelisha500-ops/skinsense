from pathlib import Path
from typing import Callable, Tuple

import torch
from torch.utils.data import Dataset
from torchvision import transforms
from PIL import Image

import config


def get_transforms(split: str) -> Callable:
    normalize = transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
    if split == "train":
        return transforms.Compose([
            transforms.Resize((config.IMAGE_SIZE + 20, config.IMAGE_SIZE + 20)),
            transforms.RandomCrop(config.IMAGE_SIZE),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomRotation(degrees=15),
            transforms.ColorJitter(
                brightness=0.3,
                contrast=0.3,
                saturation=0.2,
                hue=0.05
            ),
            transforms.ToTensor(),
            normalize,
        ])
    else:
        return transforms.Compose([
            transforms.Resize((config.IMAGE_SIZE, config.IMAGE_SIZE)),
            transforms.ToTensor(),
            normalize,
        ])


class SkinDataset(Dataset):
    def __init__(self, split: str = "train"):
        assert split in ("train", "val", "test")

        self.split        = split
        self.transform    = get_transforms(split)
        self.samples      = []
        self.class_to_idx = {cls: i for i, cls in enumerate(config.CLASSES)}

        split_dir = config.PROCESSED_DIR / split
        if not split_dir.exists():
            raise FileNotFoundError("Processed data not found at " + str(split_dir))

        for class_name in config.CLASSES:
            class_dir = split_dir / class_name
            if not class_dir.exists():
                print("[WARNING] Missing class folder: " + str(class_dir))
                continue
            label = self.class_to_idx[class_name]
            for ext in ("*.jpg", "*.jpeg", "*.png", "*.webp"):
                for img_path in class_dir.glob(ext):
                    self.samples.append((img_path, label))

        if len(self.samples) == 0:
            raise RuntimeError("No images found in " + str(split_dir))

        print("[Dataset] " + split + ": " + str(len(self.samples)) + " images")

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        img_path, label = self.samples[idx]
        image = Image.open(img_path).convert("RGB")
        image = self.transform(image)
        return image, label