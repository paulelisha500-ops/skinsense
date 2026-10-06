import json
import time
from pathlib import Path
from typing import Tuple

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import models

import config
from src.training.dataset import SkinDataset


def build_model(num_classes: int = config.NUM_CLASSES, pretrained: bool = True) -> nn.Module:
    # Inference loads our own state dict straight after, so skip the 20 MB ImageNet download.
    weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
    model = models.efficientnet_b0(weights=weights)
    for param in model.parameters():
        param.requires_grad = False
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=config.DROPOUT_RATE),
        nn.Linear(in_features, 256),
        nn.ReLU(),
        nn.Dropout(p=0.2),
        nn.Linear(256, num_classes),
    )
    return model


def unfreeze_top_layers(model: nn.Module, num_blocks: int = 3):
    total_blocks = len(model.features)
    for i, block in enumerate(model.features):
        if i >= total_blocks - num_blocks:
            for param in block.parameters():
                param.requires_grad = True
    for param in model.classifier.parameters():
        param.requires_grad = True
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print("[Fine-tune] Trainable params: " + str(trainable))


def train_one_epoch(model, loader, optimizer, criterion, device) -> Tuple[float, float]:
    model.train()
    total_loss, correct, total = 0.0, 0, 0
    for batch_idx, (images, labels) in enumerate(loader):
        images = images.to(device)
        labels = labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss    = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * images.size(0)
        preds       = outputs.argmax(dim=1)
        correct    += (preds == labels).sum().item()
        total      += images.size(0)
        if batch_idx % 20 == 0:
            print("  Batch " + str(batch_idx) + "/" + str(len(loader)) +
                  "  loss=" + str(round(loss.item(), 4)))
    return total_loss / total, correct / total


@torch.no_grad()
def evaluate(model, loader, criterion, device) -> Tuple[float, float]:
    model.eval()
    total_loss, correct, total = 0.0, 0, 0
    for images, labels in loader:
        images  = images.to(device)
        labels  = labels.to(device)
        outputs = model(images)
        loss    = criterion(outputs, labels)
        total_loss += loss.item() * images.size(0)
        preds       = outputs.argmax(dim=1)
        correct    += (preds == labels).sum().item()
        total      += images.size(0)
    return total_loss / total, correct / total


def _save_checkpoint(model: nn.Module, path):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), path)


def train():
    print("Skin Sense — Training")
    print("Device: " + config.DEVICE)

    train_ds = SkinDataset("train")
    val_ds   = SkinDataset("val")

    train_loader = DataLoader(
        train_ds, batch_size=config.BATCH_SIZE,
        shuffle=True, num_workers=config.NUM_WORKERS
    )
    val_loader = DataLoader(
        val_ds, batch_size=config.BATCH_SIZE,
        shuffle=False, num_workers=config.NUM_WORKERS
    )

    model     = build_model().to(config.DEVICE)
    criterion = nn.CrossEntropyLoss()

    print("--- Phase 1: Training classifier head ---")
    optimizer_p1 = optim.AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=config.PHASE1_LR, weight_decay=config.WEIGHT_DECAY
    )
    scheduler_p1 = optim.lr_scheduler.CosineAnnealingLR(
        optimizer_p1, T_max=config.PHASE1_EPOCHS
    )

    best_val_acc = 0.0

    for epoch in range(1, config.PHASE1_EPOCHS + 1):
        t0 = time.time()
        train_loss, train_acc = train_one_epoch(
            model, train_loader, optimizer_p1, criterion, config.DEVICE
        )
        val_loss, val_acc = evaluate(
            model, val_loader, criterion, config.DEVICE
        )
        scheduler_p1.step()
        elapsed = time.time() - t0
        print("Epoch " + str(epoch) + "/" + str(config.PHASE1_EPOCHS) +
              "  (" + str(round(elapsed)) + "s)")
        print("  Train  loss=" + str(round(train_loss, 4)) +
              "  acc=" + str(round(train_acc*100, 1)) + "%")
        print("  Val    loss=" + str(round(val_loss, 4)) +
              "  acc=" + str(round(val_acc*100, 1)) + "%")
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            _save_checkpoint(model, "best_phase1.pth")

    print("--- Phase 2: Fine-tuning ---")
    unfreeze_top_layers(model, num_blocks=3)

    optimizer_p2 = optim.AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=config.PHASE2_LR, weight_decay=config.WEIGHT_DECAY
    )
    scheduler_p2 = optim.lr_scheduler.CosineAnnealingLR(
        optimizer_p2, T_max=config.PHASE2_EPOCHS
    )

    for epoch in range(1, config.PHASE2_EPOCHS + 1):
        t0 = time.time()
        train_loss, train_acc = train_one_epoch(
            model, train_loader, optimizer_p2, criterion, config.DEVICE
        )
        val_loss, val_acc = evaluate(
            model, val_loader, criterion, config.DEVICE
        )
        scheduler_p2.step()
        elapsed = time.time() - t0
        print("Epoch " + str(epoch) + "/" + str(config.PHASE2_EPOCHS) +
              "  (" + str(round(elapsed)) + "s)")
        print("  Train  loss=" + str(round(train_loss, 4)) +
              "  acc=" + str(round(train_acc*100, 1)) + "%")
        print("  Val    loss=" + str(round(val_loss, 4)) +
              "  acc=" + str(round(val_acc*100, 1)) + "%")
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            _save_checkpoint(model, config.MODEL_PATH)

    config.MODELS_DIR.mkdir(parents=True, exist_ok=True)
    label_map = {i: cls for i, cls in enumerate(config.CLASSES)}
    with open(config.LABELS_PATH, "w") as f:
        json.dump(label_map, f, indent=2)

    print("Training complete. Best val accuracy: " + str(round(best_val_acc*100, 1)) + "%")


if __name__ == "__main__":
    train()