---
title: SkinSense
emoji: 🌿
colorFrom: yellow
colorTo: gray
sdk: gradio
sdk_version: 6.13.0
app_file: app.py
pinned: false
short_description: AI skin screening, routines and progress tracking
---

# SkinSense

Take one photo and SkinSense screens it across seven common skin conditions: acne, dry skin, eczema, hyperpigmentation, normal skin, oily skin and rosacea. It shows how confident it is, builds a morning and evening routine around the active ingredients that matter, and tracks your check-ins over a 30-day plan.

> **Medical disclaimer.** SkinSense is an educational screening tool, not a medical device. It does not diagnose, treat or cure any condition. Always consult a qualified dermatologist about a skin concern, and seek care promptly if your skin is painful, bleeding, spreading or changing rapidly.

## How it works

1. **Scan.** Upload a photo or use your camera. A fine-tuned EfficientNet-B0 classifies it and returns every category's score, not just the top one. Results under 40% confidence are marked *unclear* and ask for a better photo.
2. **Read.** You get the most likely condition, its confidence, and a severity band. Severe results, and moderate results for rosacea, eczema or hyperpigmentation, recommend a dermatologist. Normal skin is never escalated.
3. **Follow.** You get a morning and evening routine built from 34 widely available products (`data/products.json`), with a tip for every step and daily habits.
4. **Track.** Check-ins, a streak that only counts real activity (a scan or a completed routine), a trend line, and a before/after panel built from your own photos.

## Project layout

```
app.py                      Gradio UI, auth, storage, admin console
config.py                   classes, thresholds, paths
models/                     skinsense_model.pth (LFS) + class_labels.json
data/products.json          product → condition/step mapping
src/inference/              standalone predictor
src/preprocessing/          image → normalised tensor
src/recommendation/         routine + product selection
src/training/               dataset + two-phase fine-tuning script
```

## Configuration (Space → Settings → Variables and secrets)

| Secret | Required | Purpose |
|---|---|---|
| `HF_DATASET_TOKEN` | for persistence | Write token for the private dataset `Elisha622/skinsense-data`, which stores `users.json` |
| `EMAILJS_PRIVATE_KEY` | recommended | EmailJS private key. With "Use Private Key" on in EmailJS, only this server can send through your account |
| `SITE_URL` | optional | URL of the marketing site. Adds a "Full site" link to the nav |
| `APP_URL` | optional | Link used in emails (default: this Space) |
| `STREAK_REMINDERS` | optional | `on` sends one daily "keep your streak" email to people who did their routine yesterday but not yet today |
| `STREAK_REMINDER_HOUR_UTC` | optional | Hour (UTC) after which the daily streak emails go out. Default `14` |

One-time codes and reminders are sent **from the server**, so codes never reach the browser. This needs **EmailJS → Account → Security → "Allow EmailJS API for non-browser applications"** switched on. Otherwise every send fails with HTTP 403, which the logs explain. The email designs live in `emails/`. Paste each file's HTML into its EmailJS template, and set the template's *To Email* field to `{{to_email}}`:

- `emails/otp.html` is the sign-in code email. It uses `to_email` and `otp_code`. Suggested subject: `{{otp_code}} is your SkinSense sign-in code`.
- `emails/reminder.html` is the streak reminder. It uses `to_email`, `name`, `headline`, `message`, `streak`, `best_streak`, `streak_line` and `app_url`. Suggested subject: `{{headline}}`.

## Marketing site at /site

`site/` is a static export of the Next.js marketing site, served by this Space at
[/site](https://elisha622-skinsense.hf.space/site) (`serve_site` mounts it ahead of
Gradio's routes). The app's nav links to it, and its own buttons link back to the app.

To update it, rebuild from the site project and copy the export in:

```bash
STATIC_EXPORT=1 STATIC_BASE_PATH=/site \
NEXT_PUBLIC_SITE_URL=https://elisha622-skinsense.hf.space/site \
NEXT_PUBLIC_APP_URL=https://elisha622-skinsense.hf.space npx next build
cp -r out/. ../skinsense/site/
```

`STATIC_BASE_PATH` must stay in step with the mount path, or assets 404.

## Security model

- Six-digit codes come from `secrets`, are stored only as a hash on the server, and are bound to the address they were sent to. They expire after 10 minutes, are single-use, and burn after 5 wrong guesses. Each address gets at most one code per 30 s and 6 per hour.
- The signed-in email lives in server-side session state and is set only by a verified code. Every admin action re-checks it.
- All Gradio event handlers are private: nothing is exposed through `/gradio_api` or the API docs.
- User-supplied text (names, emails, messages) is HTML-escaped before rendering.
- `users.json` writes are batched every 15 s to stay under Hub commit limits. A failed download is retried and never overwrites the dataset.

## Run locally

```bash
python -m venv .venv && . .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py                                   # http://localhost:7860
```

Without `HF_DATASET_TOKEN` the app keeps users in memory. Without `EMAILJS_PRIVATE_KEY` sign-in emails can't be sent, but scanning and the landing page still work.

## Training

Put images in `data/processed/{train,val}/<class_name>/` and run `python -m src.training.train`. It trains the classifier head for 5 epochs, then fine-tunes the top 3 EfficientNet blocks for 10 epochs, and writes the best checkpoint to `models/skinsense_model.pth`.
