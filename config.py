from pathlib import Path
import torch

BASE_DIR        = Path(__file__).parent
DATA_DIR        = BASE_DIR / "data"
RAW_DIR         = DATA_DIR / "raw"
PROCESSED_DIR   = DATA_DIR / "processed"
MODELS_DIR      = BASE_DIR / "models"
MODEL_PATH      = MODELS_DIR / "skinsense_model.pth"
LABELS_PATH     = MODELS_DIR / "class_labels.json"
PRODUCTS_PATH   = DATA_DIR  / "products.json"

CLASSES = [
    "acne",
    "dry_skin",
    "eczema",
    "hyperpigmentation",
    "normal_skin",
    "oily_skin",
    "rosacea",
]
NUM_CLASSES = len(CLASSES)

IMAGE_SIZE   = 224
CHANNELS     = 3

BATCH_SIZE       = 32
NUM_WORKERS      = 0
PHASE1_EPOCHS    = 5
PHASE2_EPOCHS    = 10
PHASE1_LR        = 1e-3
PHASE2_LR        = 1e-4
WEIGHT_DECAY     = 1e-4
DROPOUT_RATE     = 0.3

SEVERITY_THRESHOLDS = {
    "mild":     0.50,
    "moderate": 0.75,
    "severe":   0.90,
}

HIGH_RISK_CONDITIONS = {"rosacea", "eczema", "hyperpigmentation"}

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"