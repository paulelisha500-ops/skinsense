import json
import numpy as np
import torch
import torch.nn as nn

import config
from src.preprocessing.image_processor import ImageProcessor


class SkinSensePredictor:
    def __init__(self):
        self.device    = config.DEVICE
        self.processor = ImageProcessor()
        self.model     = self._load_model()
        self.labels    = self._load_labels()
        print("[Predictor] Ready on " + self.device)

    def _load_model(self) -> nn.Module:
        from src.training.train import build_model
        model = build_model(num_classes=config.NUM_CLASSES, pretrained=False)
        state = torch.load(config.MODEL_PATH, map_location=self.device,
                           weights_only=True)
        model.load_state_dict(state)
        model.to(self.device)
        model.eval()
        return model

    def _load_labels(self) -> dict:
        with open(config.LABELS_PATH) as f:
            raw = json.load(f)
        return {int(k): v for k, v in raw.items()}

    @torch.no_grad()
    def predict(self, image_input) -> dict:
        tensor_np  = self.processor.process(image_input)
        tensor     = torch.from_numpy(tensor_np).unsqueeze(0).to(self.device)
        logits     = self.model(tensor)
        probs      = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()
        top_idx    = int(np.argmax(probs))
        condition  = self.labels[top_idx]
        confidence = float(probs[top_idx])
        all_scores = dict()
        for i, p in enumerate(probs):
            all_scores[self.labels[i]] = round(float(p), 4)
        severity   = self._get_severity(confidence)
        see_doctor = self._should_see_doctor(condition, severity)
        return dict(
            condition=condition,
            confidence=round(confidence, 4),
            severity=severity,
            all_scores=all_scores,
            see_doctor=see_doctor
        )

    def _get_severity(self, confidence: float) -> str:
        t = config.SEVERITY_THRESHOLDS
        if confidence >= t["severe"]:
            return "severe"
        elif confidence >= t["moderate"]:
            return "moderate"
        else:
            return "mild"

    def _should_see_doctor(self, condition: str, severity: str) -> bool:
        if severity == "severe":
            return True
        if condition in config.HIGH_RISK_CONDITIONS and severity == "moderate":
            return True
        return False