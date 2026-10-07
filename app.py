import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import io
import base64
import json
import datetime
import hashlib
import html as html_lib
import secrets
import threading
import time
import atexit
import urllib.error
import urllib.request
import warnings

import gradio as gr
import torch
import numpy as np
import cv2
from PIL import Image
from huggingface_hub import HfApi, hf_hub_download
from starlette.middleware import Middleware
from starlette.middleware.gzip import GZipMiddleware

import config
from src.preprocessing.image_processor import ImageProcessor
from src.training.train import build_model
from src.recommendation.routine import build_routine

# Gradio reads a status constant newer Starlette deprecates, which printed two
# warning lines on every click and buried real errors in the Space logs.
warnings.filterwarnings("ignore", message=".*HTTP_422_UNPROCESSABLE_ENTITY")

# ── Configuration ───────────────────────────────────────────────────────────────
# Public EmailJS identifiers are safe to ship. Mail is sent from the server with
# the account's private key, so one-time codes never reach the browser.
EMAILJS_PUBLIC_KEY = "QtslmYbPNufYEv0lA"
EMAILJS_SERVICE_ID = "service_87smsri"
EMAILJS_TEMPLATE_ID = "template_b4oghr3"
EMAILJS_REMINDER_TEMPLATE_ID = "template_cxdpu0j"
EMAILJS_PRIVATE_KEY = os.environ.get("EMAILJS_PRIVATE_KEY", "").strip()
EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send"

ADMIN_EMAIL = "paulelisha622@gmail.com"
DATASET_REPO_ID = "Elisha622/skinsense-data"
# The marketing site is a static export committed to site/ and served by this
# Space at /site (see serve_site at the bottom of the file).
SITE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "site")
SITE_URL = os.environ.get("SITE_URL") or ("/site" if os.path.isdir(SITE_DIR) else "")
APP_URL = os.environ.get("APP_URL", "https://elisha622-skinsense.hf.space")   # link in emails
# Automatic daily "keep your streak" emails; off unless the Space variable is set.
STREAK_REMINDERS = os.environ.get("STREAK_REMINDERS", "off").strip().lower() in ("1", "on", "true", "yes")
STREAK_REMINDER_HOUR_UTC = int(os.environ.get("STREAK_REMINDER_HOUR_UTC", "14"))

OTP_TTL_SECONDS = 600        # a code is valid for 10 minutes
OTP_MAX_ATTEMPTS = 5         # wrong guesses before the code is burned
OTP_RESEND_COOLDOWN = 30     # seconds between emails to the same address
SAVE_DEBOUNCE_SECONDS = 15   # batch dataset commits instead of one per click
UNCERTAIN_BELOW = 0.40       # top score below this means "we can't tell"

# ══════════════════════════════════════════════════════════════════════════════
# BRAND SYSTEM — espresso / coffee / caramel / tan / cream
# ══════════════════════════════════════════════════════════════════════════════
FOREST  = "#3B2A20"   # espresso — primary brand, buttons, headers
PINE    = "#5A3E2B"   # coffee — hover / gradient partner
EMERALD = "#8A5A36"   # brown — accents, positive status
JADE    = "#B07A4A"   # caramel — highlights, gradients
MINT    = "#F3E8DA"   # latte fill
MIST    = "#FAF5EE"   # page background
WHITE   = "#FFFFFF"
INK     = "#2A1D15"   # primary text (espresso-black)
SUBTLE  = "#6E5645"   # secondary text
FAINT   = "#8E7563"   # tertiary text
LINE    = "#E9DCCB"   # borders
FILL    = "#F6EEE3"   # soft fill
CARD    = WHITE
PAGE    = MIST

GREEN = EMERALD
GOOD  = "#5E7A3E"   # positive status (olive)
AMBER = "#B07D18"
RED   = "#B3402F"

# ── Verified imagery (Unsplash, free licence) ───────────────────────────────────
U = "https://images.unsplash.com/"
IMG = {
    # each URL audited visually before use
    "hero_face": U + "photo-1531123897727-8f129e1688ce?w=900&q=80&auto=format",   # close-up portrait
    "hero_care": U + "photo-1616394584738-fc6e612e71b9?w=900&q=80&auto=format",   # facial treatment
    "step_scan": U + "photo-1509967419530-da38b4704bc6?w=700&q=80&auto=format",   # portrait, hand to face
    "step_read": U + "photo-1526510747491-58f928ec870f?w=700&q=80&auto=format",   # portrait, clear skin
    "step_plan": U + "photo-1598440947619-2c35fc9aa908?w=700&q=80&auto=format",   # skincare products
    "about":     U + "photo-1570172619644-dfd03ed5d881?w=900&q=80&auto=format",   # treatment being applied
    "routine":   U + "photo-1556228720-195a672e8a03?w=700&q=80&auto=format",      # cleanser + texture
    "face1":     U + "photo-1580489944761-15a19d654956?w=400&q=80&auto=format",   # smiling, clear skin
}

# ── Logo ────────────────────────────────────────────────────────────────────────
def logo_svg(size=40, gid="a", light=False):
    """SkinSense mark: a scan ring around a leaf-droplet."""
    c1 = "#E6C9A3" if light else JADE
    c2 = "#B07A4A" if light else FOREST
    ring = "#EAD7BE" if light else EMERALD
    vein = "#3B2A20" if light else "#FFFFFF"
    return (
        '<svg width="' + str(size) + '" height="' + str(size) + '" viewBox="0 0 48 48" '
        'fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;display:block;">'
        '<defs><linearGradient id="ssl' + gid + '" x1="10" y1="8" x2="38" y2="42" '
        'gradientUnits="userSpaceOnUse">'
        '<stop stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/>'
        '</linearGradient></defs>'
        '<circle cx="24" cy="24" r="21.2" stroke="' + ring + '" stroke-width="2.4" '
        'stroke-linecap="round" stroke-dasharray="88 22"/>'
        '<path d="M24 9.5c6.4 4.6 10.6 10.2 10.6 15.6 0 6-4.7 10.4-10.6 10.4S13.4 31.1 13.4 25.1'
        'c0-5.4 4.2-11 10.6-15.6z" fill="url(#ssl' + gid + ')"/>'
        '<path d="M24 15.5v15.8" stroke="' + vein + '" stroke-width="1.5" '
        'stroke-linecap="round" opacity="0.9"/>'
        '<path d="M24 22.6l4.4-3.6M24 27.4l-4.4-3.6" stroke="' + vein + '" stroke-width="1.5" '
        'stroke-linecap="round" opacity="0.9"/>'
        '</svg>'
    )


def wordmark(size=40, gid="a", light=False, sub=""):
    ink = "#FFFFFF" if light else INK
    dim = "#CDB49A" if light else FAINT
    html = (
        '<div style="display:flex;align-items:center;gap:11px;">'
        + logo_svg(size, gid, light) +
        '<div style="line-height:1.05;">'
        '<div style="font-size:' + str(round(size * 0.44, 2)) + 'px;font-weight:750;'
        'color:' + ink + ';letter-spacing:-0.025em;">Skin<span style="color:'
        + (JADE if not light else "#E6C9A3") + ';">Sense</span></div>'
    )
    if sub:
        html += ('<div style="font-size:' + str(round(size * 0.2, 2)) + 'px;color:' + dim + ';'
                 'letter-spacing:0.16em;text-transform:uppercase;margin-top:3px;font-weight:600;">'
                 + sub + '</div>')
    html += '</div></div>'
    return html


# ── Skin analysis helpers ───────────────────────────────────────────────────────
def get_severity(confidence, condition=None):
    # Normal skin has nothing to grade: a confident "normal" must never read as severe.
    if condition == "normal_skin":
        return "mild"
    t = config.SEVERITY_THRESHOLDS
    if confidence >= t["severe"]:
        return "severe"
    elif confidence >= t["moderate"]:
        return "moderate"
    return "mild"


def should_see_doctor(condition, severity, confidence=1.0):
    if condition == "normal_skin" or confidence < UNCERTAIN_BELOW:
        return False
    if severity == "severe":
        return True
    if condition in config.HIGH_RISK_CONDITIONS and severity == "moderate":
        return True
    return False


def esc(text):
    """Escape user-supplied text before it is placed inside an HTML string."""
    return html_lib.escape(str(text if text is not None else ""), quote=True)


def pil_to_bgr(image):
    if image is None:
        return None
    if isinstance(image, np.ndarray):
        if len(image.shape) == 2:
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
        if image.shape[2] == 4:
            image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)
        pil_img = Image.fromarray(image.astype(np.uint8))
    else:
        pil_img = image
    pil_img = pil_img.convert("RGB")
    img_rgb = np.array(pil_img)
    return cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)


def to_data_uri(image, max_w=460):
    """Compress an uploaded photo to an inline JPEG data URI for before/after."""
    try:
        if image is None:
            return ""
        if isinstance(image, np.ndarray):
            pil = Image.fromarray(image.astype(np.uint8))
        else:
            pil = image
        pil = pil.convert("RGB")
        w, h = pil.size
        if w > max_w:
            pil = pil.resize((max_w, max(1, int(h * max_w / w))), Image.LANCZOS)
        buf = io.BytesIO()
        pil.save(buf, format="JPEG", quality=82, optimize=True)
        return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("ascii")
    except Exception:
        return ""


FREQ_MAP = {"Never": 0, "Rarely": 1, "Often": 2, "Daily": 3}


def compute_lifestyle(profile):
    if not profile:
        return None
    values = []
    for key in ("oily_food", "fast_food", "sweets"):
        v = profile.get(key)
        if v in FREQ_MAP:
            values.append(FREQ_MAP[v])
    if not values:
        return None
    total = sum(values)
    if total <= 2:
        risk = "Low"
    elif total <= 5:
        risk = "Moderate"
    else:
        risk = "High"
    return {"total": total, "risk": risk}


# ══════════════════════════════════════════════════════════════════════════════
# PERSISTENT STORAGE — backed by a private Hugging Face Dataset repo.
# ══════════════════════════════════════════════════════════════════════════════
USERS_CACHE = {}
USERS_LOADED = False
USERS_LOCK = threading.RLock()
STORAGE_READY = False      # True only once we know what is actually on the Hub
_SAVE_PENDING = False
_LAST_LOAD_ATTEMPT = 0.0
SEVERITY_RANK = {"mild": 0, "moderate": 1, "severe": 2}

try:
    from huggingface_hub.errors import EntryNotFoundError
except ImportError:  # older huggingface_hub
    from huggingface_hub.utils import EntryNotFoundError


def today_str():
    return datetime.date.today().isoformat()


def get_hf_api():
    token = os.environ.get("HF_DATASET_TOKEN")
    if not token:
        return None
    return HfApi(token=token)


def ensure_dataset_repo():
    api = get_hf_api()
    if api is None:
        return False
    try:
        api.create_repo(repo_id=DATASET_REPO_ID, repo_type="dataset",
                        private=True, exist_ok=True)
        return True
    except Exception as e:
        print("Dataset repo error: " + str(e))
        return False


def load_users():
    """Load users.json once. A failed download is retried later and is never
    treated as "no users" — otherwise the next save would wipe the dataset."""
    global USERS_CACHE, USERS_LOADED, STORAGE_READY, _LAST_LOAD_ATTEMPT
    with USERS_LOCK:
        if USERS_LOADED or time.time() - _LAST_LOAD_ATTEMPT < 30:
            return USERS_CACHE
        _LAST_LOAD_ATTEMPT = time.time()
        api = get_hf_api()
        if api is None:
            USERS_LOADED = True
            print("HF_DATASET_TOKEN not set — running without persistent storage.")
            return USERS_CACHE
        ensure_dataset_repo()
        try:
            path = hf_hub_download(
                repo_id=DATASET_REPO_ID,
                filename="users.json",
                repo_type="dataset",
                token=os.environ.get("HF_DATASET_TOKEN"),
                force_download=True,
            )
            with open(path) as f:
                remote = json.load(f)
            # keep anyone who signed up while the Hub was unreachable
            for key, record in USERS_CACHE.items():
                remote.setdefault(key, record)
            USERS_CACHE = remote
            print("Loaded " + str(len(USERS_CACHE)) + " user record(s).")
        except EntryNotFoundError:
            print("No users.json yet — starting fresh.")
        except Exception as e:
            print("Could not load users.json, will retry without overwriting: " + str(e))
            return USERS_CACHE
        USERS_LOADED = True
        STORAGE_READY = True
        return USERS_CACHE


def _flush_users():
    global _SAVE_PENDING
    api = get_hf_api()
    with USERS_LOCK:
        if not _SAVE_PENDING or api is None or not STORAGE_READY:
            return
        data = json.dumps(USERS_CACHE, indent=2).encode("utf-8")
        _SAVE_PENDING = False
    try:
        api.upload_file(
            path_or_fileobj=data,
            path_in_repo="users.json",
            repo_id=DATASET_REPO_ID,
            repo_type="dataset",
            commit_message="Update users",
        )
    except Exception as e:
        print("Save users error: " + str(e))
        with USERS_LOCK:
            _SAVE_PENDING = True


def _save_loop():
    while True:
        time.sleep(SAVE_DEBOUNCE_SECONDS)
        if not USERS_LOADED:
            load_users()
        _flush_users()


def save_users():
    """Mark users dirty. A background thread commits at most every few seconds;
    one commit per click would run into the Hub's commit rate limit."""
    global _SAVE_PENDING
    with USERS_LOCK:
        _SAVE_PENDING = True


threading.Thread(target=_save_loop, daemon=True).start()
atexit.register(_flush_users)


def get_or_create_user(email):
    with USERS_LOCK:
        users = load_users()
        key = email.strip().lower()
        if key not in users:
            users[key] = {
                "email": key,
                "name": "",
                "age": None,
                "weight": None,
                "height": None,
                "profile": {},
                "created_at": today_str(),
                "last_active": None,
                "last_login": None,
                "streak": 0,
                "longest_streak": 0,
                "plan": None,
                "flagged_for_doctor": False,
                "pending_reminder": "",
            }
            save_users()
        return users[key]


def current_streak(user):
    """Stored streak, or 0 if the user has already missed a day since."""
    last = user.get("last_active")
    if not last:
        return 0
    try:
        gap = (datetime.date.today() - datetime.date.fromisoformat(last)).days
    except Exception:
        return 0
    return user.get("streak", 0) if gap <= 1 else 0


def touch_activity(email):
    """Count today towards the streak. Only real activity (a scan or a completed
    routine) calls this — simply signing in does not."""
    with USERS_LOCK:
        user = get_or_create_user(email)
        today = today_str()
        last = user.get("last_active")
        if last == today:
            pass
        elif last is None:
            user["streak"] = 1
        else:
            try:
                gap = (datetime.date.fromisoformat(today)
                       - datetime.date.fromisoformat(last)).days
            except Exception:
                gap = 999
            if gap == 1:
                user["streak"] = user.get("streak", 0) + 1
            elif gap > 1:
                user["streak"] = 1
        user["longest_streak"] = max(user.get("longest_streak", 0), user.get("streak", 0))
        user["last_active"] = today
        save_users()
        return user


def record_login(email):
    with USERS_LOCK:
        user = get_or_create_user(email)
        user["last_login"] = today_str()
        save_users()
        return user


def persist_profile_to_db(email, profile):
    with USERS_LOCK:
        user = get_or_create_user(email)
        user["name"] = profile.get("name", "")
        user["age"] = profile.get("age")
        user["weight"] = profile.get("weight")
        user["height"] = profile.get("height")
        user["profile"] = profile
        user["profile_done"] = True
        save_users()


def record_analysis(email, condition, confidence, severity):
    with USERS_LOCK:
        user = get_or_create_user(email)
        if user.get("plan") is None:
            user["plan"] = {
                "condition": condition,
                "started_at": today_str(),
                "checkins": [],
            }
        checkin = {
            "date": today_str(),
            "condition": condition,
            "confidence": round(confidence, 4),
            "severity": severity,
        }
        user["plan"]["checkins"].append(checkin)

        recent = user["plan"]["checkins"][-3:]
        severe_count = sum(1 for c in recent
                           if c["severity"] == "severe" and c["condition"] != "normal_skin")
        worsening = False
        if len(recent) >= 2:
            ranks = [SEVERITY_RANK.get(c["severity"], 0) for c in recent]
            worsening = ranks[-1] > ranks[0]
        user["flagged_for_doctor"] = (condition != "normal_skin"
                                      and (severe_count >= 2 or (len(recent) >= 3 and worsening)))

        touch_activity(email)
        return user


def record_routine_done(email):
    return touch_activity(email)


def plan_day_number(user):
    plan = user.get("plan")
    if not plan:
        return 0
    try:
        started = datetime.date.fromisoformat(plan["started_at"])
        today = datetime.date.today()
        return (today - started).days + 1
    except Exception:
        return 0


def get_all_users_summary():
    with USERS_LOCK:
        users = dict(load_users())
    rows = []
    today = datetime.date.today()
    for email, u in users.items():
        last = u.get("last_active")
        if last:
            try:
                days_ago = (today - datetime.date.fromisoformat(last)).days
            except Exception:
                days_ago = None
        else:
            days_ago = None
        rows.append({
            "email": email,
            "name": u.get("name") or "—",
            "streak": current_streak(u),
            "days_ago": days_ago,
            "day_in_plan": plan_day_number(u),
            "flagged": u.get("flagged_for_doctor", False),
        })
    rows.sort(key=lambda r: (r["days_ago"] is None, r["days_ago"] or 0), reverse=True)
    return rows


def queue_reminder(email, message):
    with USERS_LOCK:
        users = load_users()
        key = email.strip().lower()
        if key in users:
            users[key]["pending_reminder"] = message
            save_users()


def delete_user(email):
    """Drop a user's record. Goes through the normal save path, so the deletion
    sticks; editing users.json on the Hub by hand would be overwritten by the next
    save from memory. Returns True if a record was removed."""
    with USERS_LOCK:
        if load_users().pop(email.strip().lower(), None) is None:
            return False
        save_users()
        return True


def pop_pending_reminder(email):
    with USERS_LOCK:
        users = load_users()
        user = users.get(email.strip().lower())
        if not user:
            return ""
        msg = user.get("pending_reminder", "")
        if msg:
            user["pending_reminder"] = ""
            save_users()
        return msg


# ══════════════════════════════════════════════════════════════════════════════
# EMAIL + ONE-TIME CODES — everything stays on the server.
# ══════════════════════════════════════════════════════════════════════════════
PENDING_OTPS = {}      # email -> {"hash", "expires", "attempts"}
OTP_SENDS = {}         # email -> timestamps of codes sent in the last hour
OTP_MAX_PER_HOUR = 6
OTP_LOCK = threading.Lock()


def send_email(template_id, params):
    """Send through the EmailJS REST API from the server. Needs "Allow EmailJS API
    for non-browser applications" switched on in the EmailJS dashboard (Account →
    Security). EMAILJS_PRIVATE_KEY is optional but recommended: with "Use Private
    Key" also switched on, nobody else can send mail through this account."""
    payload = {
        "service_id": EMAILJS_SERVICE_ID,
        "template_id": template_id,
        "user_id": EMAILJS_PUBLIC_KEY,
        "template_params": params,
    }
    if EMAILJS_PRIVATE_KEY:
        payload["accessToken"] = EMAILJS_PRIVATE_KEY
    body = json.dumps(payload).encode("utf-8")
    # EmailJS sits behind Cloudflare, which rejects Python's default
    # "Python-urllib" User-Agent with "error code: 1010" before EmailJS sees it.
    req = urllib.request.Request(EMAILJS_ENDPOINT, data=body, method="POST", headers={
        "Content-Type": "application/json",
        "User-Agent": "SkinSense/1.0 (+" + APP_URL + ")",
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status == 200
    except urllib.error.HTTPError as e:
        # Keep these log lines ASCII so an odd console encoding can never turn a
        # failed send into a crash.
        detail = e.read().decode("utf-8", "replace")[:300].encode("ascii", "replace").decode()
        print("EmailJS error " + str(e.code) + ": " + detail)
        if e.code == 403 and "1010" in detail:
            print("  -> Blocked by Cloudflare before reaching EmailJS (User-Agent).")
        elif e.code == 403:
            print("  -> In EmailJS, Account > Security: turn on 'Allow EmailJS API for "
                  "non-browser applications', and set EMAILJS_PRIVATE_KEY if 'Use "
                  "Private Key' is on.")
    except Exception as e:
        print("EmailJS exception: " + str(e))
    return False


def _otp_hash(email, code):
    return hashlib.sha256((email + ":" + code).encode("utf-8")).hexdigest()


def issue_otp(email):
    """Create a code for this email and mail it. Returns (ok, message)."""
    key = email.strip().lower()
    now = time.time()
    with OTP_LOCK:
        # Send history outlives the code itself, so neither verifying nor burning a
        # code resets the limits (stops inbox flooding and guess-then-resend loops).
        recent = [t for t in OTP_SENDS.get(key, []) if now - t < 3600]
        if recent and now - recent[-1] < OTP_RESEND_COOLDOWN:
            wait = int(OTP_RESEND_COOLDOWN - (now - recent[-1])) + 1
            return False, "Please wait " + str(wait) + "s before requesting another code."
        if len(recent) >= OTP_MAX_PER_HOUR:
            return False, "Too many codes requested for this address. Try again in an hour."
        code = str(secrets.randbelow(900000) + 100000)
        PENDING_OTPS[key] = {"hash": _otp_hash(key, code), "expires": now + OTP_TTL_SECONDS,
                             "attempts": 0}
        OTP_SENDS[key] = recent + [now]
    if not send_email(EMAILJS_TEMPLATE_ID, {"to_email": key, "otp_code": code}):
        with OTP_LOCK:
            PENDING_OTPS.pop(key, None)
            OTP_SENDS[key] = OTP_SENDS.get(key, [])[:-1]   # a failed send doesn't count
        return False, "We couldn't send the email right now. Please try again shortly."
    return True, ""


def check_otp(email, code):
    """Returns (ok, message). A code works once, for one email, for 10 minutes."""
    key = (email or "").strip().lower()
    code = (code or "").strip()
    with OTP_LOCK:
        entry = PENDING_OTPS.get(key)
        if not entry:
            return False, "Request a code first."
        if time.time() > entry["expires"]:
            PENDING_OTPS.pop(key, None)
            return False, "That code has expired. Request a new one."
        if entry["attempts"] >= OTP_MAX_ATTEMPTS:
            PENDING_OTPS.pop(key, None)
            return False, "Too many attempts. Request a new code."
        if not secrets.compare_digest(entry["hash"], _otp_hash(key, code)):
            entry["attempts"] += 1
            return False, "That code didn't match. Try again."
        PENDING_OTPS.pop(key, None)
    return True, ""


def is_admin(email):
    return bool(email) and email.strip().lower() == ADMIN_EMAIL.strip().lower()


# ── Load model once at startup ─────────────────────────────────────────────────
print("Loading model...")
processor = ImageProcessor()

with open(config.LABELS_PATH) as f:
    raw_labels = json.load(f)
labels = {int(k): v for k, v in raw_labels.items()}

model = build_model(num_classes=config.NUM_CLASSES, pretrained=False)
state = torch.load(config.MODEL_PATH, map_location=config.DEVICE, weights_only=True)
model.load_state_dict(state)
model.to(config.DEVICE)
model.eval()
print("Model ready!")
print("Email: EmailJS REST from the server ("
      + ("private key set" if EMAILJS_PRIVATE_KEY else "no private key, relying on public key") + ")")
load_users()


# ══════════════════════════════════════════════════════════════════════════════
# CONTENT — About / FAQ / marketing copy
# ══════════════════════════════════════════════════════════════════════════════
FAQ_ITEMS = [
    ("Is SkinSense a medical diagnosis?",
     "No. SkinSense is an educational screening tool. It gives you a likely category and a "
     "care routine to try, but it is not a diagnosis and it does not replace a consultation "
     "with a qualified dermatologist. If your result is flagged as severe, or your skin is "
     "painful, bleeding, spreading or changing quickly, please see a doctor."),
    ("Which conditions can it recognise?",
     "Seven categories: acne, dry skin, eczema, hyperpigmentation, normal skin, oily skin "
     "and rosacea. Anything outside those seven will still be sorted into the closest "
     "category, so read the full confidence breakdown rather than only the headline result."),
    ("How accurate is the analysis?",
     "Accuracy depends heavily on your photo. Good, even lighting, a clean face and a "
     "centred, in-focus shot give the most reliable result. Every analysis shows a "
     "confidence score and a full breakdown across all seven categories so you can judge "
     "how certain the model actually is."),
    ("What happens to my photos?",
     "Your photo is analysed and used to render your result and your before/after "
     "comparison. It is not sold or shared. Only your email, the profile answers you "
     "choose to give, and your check-in history are stored, in a private dataset used to "
     "keep your streak and progress."),
    ("Why do you ask about my diet?",
     "Diet is not the cause of every skin condition, but frequent fried and sugary food is "
     "associated with worse outcomes for acne, oily skin and hyperpigmentation. The "
     "questions are optional and you can skip every one of them."),
    ("Do I need to buy the products you recommend?",
     "No. The routine is a template built from widely available drugstore and pharmacy "
     "products, shown so you can see the active ingredients that matter. Any product with "
     "the same key ingredients will do the same job."),
    ("How long before I see a change?",
     "Skin turns over slowly. Most routines need four to eight weeks of consistent use "
     "before a visible difference, and pigmentation can take twelve weeks or more. The "
     "progress tracker is there to help you stay with it long enough to judge fairly."),
    ("Is SkinSense free?",
     "Yes. Sign in with your email, verify the code, and everything is available — "
     "analysis, routines, streaks and progress tracking."),
]


def build_faq_html(items, dark=False):
    bg = "rgba(255,255,255,0.06)" if dark else WHITE
    border = "rgba(255,255,255,0.14)" if dark else LINE
    q_color = "#FFFFFF" if dark else INK
    a_color = "#D9C4AE" if dark else SUBTLE
    mark = "#E6C9A3" if dark else EMERALD
    out = '<div style="display:flex;flex-direction:column;gap:10px;">'
    for q, a in items:
        out += (
            '<details style="background:' + bg + ';border:1px solid ' + border + ';'
            'border-radius:14px;padding:0;overflow:hidden;">'
            '<summary style="cursor:pointer;list-style:none;padding:16px 20px;'
            'font-size:0.9rem;font-weight:600;color:' + q_color + ';display:flex;'
            'align-items:center;justify-content:space-between;gap:14px;">'
            '<span>' + q + '</span>'
            '<span style="color:' + mark + ';font-size:1.15rem;font-weight:400;'
            'line-height:1;flex-shrink:0;">+</span></summary>'
            '<div style="padding:0 20px 18px;font-size:0.85rem;line-height:1.7;'
            'color:' + a_color + ';">' + a + '</div>'
            '</details>'
        )
    return out + '</div>'


CONDITIONS_INFO = [
    ("Acne", "Clogged pores, papules and pustules", "#E8756B"),
    ("Dry skin", "Tightness, flaking, rough texture", "#7FA9D4"),
    ("Eczema", "Itchy, inflamed, recurring patches", "#D48A5C"),
    ("Hyperpigmentation", "Dark marks and uneven tone", "#9B7BB8"),
    ("Normal skin", "Balanced, no active concern", EMERALD),
    ("Oily skin", "Excess sebum and midday shine", "#D4B85C"),
    ("Rosacea", "Persistent redness and flushing", "#C96A85"),
]


def build_condition_chips():
    out = ('<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));'
           'gap:12px;">')
    for name, desc, colour in CONDITIONS_INFO:
        out += (
            '<div class="ss-card" style="background:' + WHITE + ';border:1px solid ' + LINE + ';'
            'border-radius:15px;padding:16px 18px;display:flex;gap:12px;align-items:flex-start;">'
            '<span style="width:9px;height:9px;border-radius:50%;background:' + colour + ';'
            'margin-top:6px;flex-shrink:0;"></span><div>'
            '<div style="font-size:0.88rem;font-weight:650;color:' + INK + ';">' + name + '</div>'
            '<div style="font-size:0.76rem;color:' + SUBTLE + ';margin-top:3px;line-height:1.5;">'
            + desc + '</div></div></div>'
        )
    return out + '</div>'


def _step_card(num, title, body, img):
    return (
        '<div class="ss-card" style="background:' + WHITE + ';border:1px solid ' + LINE + ';'
        'border-radius:20px;overflow:hidden;display:flex;flex-direction:column;">'
        '<div class="ss-zoomwrap" style="height:158px;overflow:hidden;background:' + MINT + ';">'
        '<img data-zoom tabindex="0" src="' + img + '" alt="' + title + '" loading="lazy" '
        'style="width:100%;height:100%;object-fit:cover;display:block;"></div>'
        '<div style="padding:20px 22px 24px;">'
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">'
        '<span style="width:26px;height:26px;border-radius:9px;background:' + FOREST + ';'
        'color:#fff;font-size:0.74rem;font-weight:700;display:inline-flex;'
        'align-items:center;justify-content:center;">' + str(num) + '</span>'
        '<span style="font-size:0.97rem;font-weight:700;color:' + INK + ';">' + title + '</span>'
        '</div>'
        '<p style="font-size:0.83rem;color:' + SUBTLE + ';line-height:1.65;margin:0;">'
        + body + '</p></div></div>'
    )


def _stat(value, label):
    return (
        '<div style="text-align:center;padding:0 12px;">'
        '<div style="font-size:1.75rem;font-weight:750;color:#FFFFFF;letter-spacing:-0.02em;">'
        + value + '</div>'
        '<div style="font-size:0.7rem;color:#CDB49A;letter-spacing:0.1em;text-transform:uppercase;'
        'margin-top:5px;font-weight:600;">' + label + '</div></div>'
    )


def section_eyebrow(text, dark=False):
    colour = "#E6C9A3" if dark else EMERALD
    return ('<p style="font-size:0.68rem;letter-spacing:0.16em;text-transform:uppercase;'
            'color:' + colour + ';font-weight:700;margin:0 0 10px;">' + text + '</p>')


def section_title(text, dark=False):
    colour = "#FFFFFF" if dark else INK
    return ('<h2 style="font-size:1.72rem;font-weight:750;color:' + colour + ';margin:0 0 12px;'
            'letter-spacing:-0.025em;line-height:1.2;">' + text + '</h2>')


def section_lede(text, dark=False):
    colour = "#D9C4AE" if dark else SUBTLE
    return ('<p style="font-size:0.95rem;color:' + colour + ';line-height:1.7;margin:0 0 30px;'
            'max-width:660px;">' + text + '</p>')


def _ba_slot(title, sub, gid):
    """Empty labelled slot — we never illustrate before/after with stock faces."""
    return (
        '<div style="border-radius:18px;border:1px dashed rgba(230,201,163,0.45);'
        'background:rgba(255,255,255,0.05);height:190px;display:flex;'
        'flex-direction:column;align-items:center;justify-content:center;'
        'text-align:center;padding:20px;">'
        + logo_svg(34, gid, light=True) +
        '<div style="font-size:0.85rem;font-weight:700;color:#FFFFFF;margin:12px 0 5px;">'
        + title + '</div>'
        '<div style="font-size:0.74rem;color:#CDB49A;line-height:1.5;max-width:180px;">'
        + sub + '</div></div>'
    )


# ── Landing page ────────────────────────────────────────────────────────────────
LANDING_HERO = (
    '<div class="ss-wide">'

    # top bar
    '<div style="display:flex;align-items:center;justify-content:space-between;'
    'padding:22px 0 0;flex-wrap:wrap;gap:16px;">'
    + wordmark(42, "nav", light=False, sub="Skin analysis")
    + '<nav class="ss-nav" aria-label="Sections" style="display:flex;gap:26px;'
      'align-items:center;font-size:0.85rem;color:' + SUBTLE + ';font-weight:550;">'
      '<a href="#ss-how" style="color:' + SUBTLE + ';text-decoration:none;">How it works</a>'
      '<a href="#ss-progress" style="color:' + SUBTLE + ';text-decoration:none;">Progress</a>'
      '<a href="#ss-about" style="color:' + SUBTLE + ';text-decoration:none;">About us</a>'
      '<a href="#ss-faq" style="color:' + SUBTLE + ';text-decoration:none;">FAQ</a>'
    + (('<a href="' + esc(SITE_URL) + '" target="_blank" rel="noopener" style="color:'
        + EMERALD + ';text-decoration:none;font-weight:650;">Full site &nearr;</a>')
       if SITE_URL else '')
    + '</nav></div>'

    # hero
    '<div style="display:grid;grid-template-columns:1.05fr 0.95fr;gap:48px;align-items:center;'
    'padding:56px 0 8px;position:relative;" class="ss-hero-grid">'
    '<div class="ss-dotgrid" aria-hidden="true"></div>'

    '<div>'
    '<div style="display:inline-flex;align-items:center;gap:8px;background:' + MINT + ';'
    'border:1px solid ' + LINE + ';border-radius:100px;padding:7px 15px;margin-bottom:22px;">'
    '<span style="width:7px;height:7px;border-radius:50%;background:' + EMERALD + ';"></span>'
    '<span style="font-size:0.74rem;font-weight:650;color:' + PINE + ';letter-spacing:0.02em;">'
    'Free &middot; 7 conditions &middot; Results in seconds</span></div>'

    '<h1 style="font-size:3.05rem;line-height:1.06;font-weight:780;color:' + INK + ';'
    'margin:0 0 20px;letter-spacing:-0.035em;">Understand your skin.<br>'
    '<span style="color:' + EMERALD + ';">Then actually improve it.</span></h1>'

    '<p style="font-size:1.03rem;color:' + SUBTLE + ';line-height:1.72;margin:0 0 30px;'
    'max-width:520px;">Take one photo. SkinSense screens it across seven common skin '
    'conditions, explains how confident it is, and builds you a morning and evening '
    'routine you can actually follow — then tracks whether it is working.</p>'

    '<div style="display:flex;gap:26px;flex-wrap:wrap;margin-bottom:6px;">'
    '<div><div style="font-size:1.3rem;font-weight:750;color:' + INK + ';">7</div>'
    '<div style="font-size:0.74rem;color:' + FAINT + ';font-weight:600;">Conditions</div></div>'
    '<div><div style="font-size:1.3rem;font-weight:750;color:' + INK + ';">30-day</div>'
    '<div style="font-size:0.74rem;color:' + FAINT + ';font-weight:600;">Guided plan</div></div>'
    '<div><div style="font-size:1.3rem;font-weight:750;color:' + INK + ';">&lt;5s</div>'
    '<div style="font-size:0.74rem;color:' + FAINT + ';font-weight:600;">Per analysis</div></div>'
    '</div></div>'

    # hero collage
    '<div style="position:relative;height:430px;" class="ss-hero-art">'
    # auto-advancing slideshow; every photo opens in the lightbox on click
    '<div class="ss-zoomwrap" style="position:absolute;top:0;right:0;width:74%;height:270px;'
    'border-radius:24px;overflow:hidden;background:' + MINT + ';'
    'box-shadow:0 22px 50px -18px rgba(59,42,32,0.42);">'
    '<div class="ss-slides">'
    '<img data-zoom tabindex="0" src="' + IMG["hero_face"] + '" alt="Close-up portrait, clear skin">'
    '<img data-zoom tabindex="0" src="' + IMG["step_read"] + '" alt="Portrait in soft natural light" '
    'loading="lazy">'
    '<img data-zoom tabindex="0" src="' + IMG["face1"].replace("w=400", "w=900") + '" '
    'alt="Smiling portrait, clear skin" loading="lazy">'
    '</div>'
    '<div class="ss-slide-dots" aria-hidden="true"><span></span><span></span><span></span></div>'
    '</div>'
    '<div class="ss-zoomwrap" style="position:absolute;bottom:14px;left:0;width:60%;height:210px;'
    'border-radius:22px;overflow:hidden;border:5px solid #fff;'
    'box-shadow:0 18px 40px -16px rgba(59,42,32,0.38);">'
    '<img data-zoom tabindex="0" src="' + IMG["hero_care"] + '" alt="Facial treatment" loading="lazy" '
    'style="width:100%;height:100%;object-fit:cover;display:block;"></div>'
    '<div class="ss-float" style="position:absolute;bottom:44px;right:6px;background:#fff;'
    'border-radius:16px;padding:13px 17px;box-shadow:0 14px 34px -12px rgba(59,42,32,0.34);'
    'border:1px solid ' + LINE + ';">'
    '<div style="font-size:0.6rem;letter-spacing:0.11em;text-transform:uppercase;'
    'color:' + FAINT + ';font-weight:700;margin-bottom:5px;">Example reading</div>'
    '<div style="font-size:0.94rem;font-weight:700;color:' + INK + ';margin-bottom:7px;">'
    'Mild acne</div>'
    '<div style="width:118px;height:5px;background:' + FILL + ';border-radius:100px;'
    'overflow:hidden;"><div style="width:72%;height:100%;background:' + EMERALD + ';'
    'border-radius:100px;"></div></div></div>'
    '</div></div></div>'
)

LANDING_BODY = (
    '<div class="ss-wide">'

    # ── how it works
    '<div id="ss-how" class="ss-reveal" style="padding:64px 0 0;">'
    + section_eyebrow("How it works")
    + section_title("Three steps, about a minute")
    + section_lede("No forms to fill in before you see a result. Photo in, plan out — "
                   "the optional profile questions only sharpen the advice afterwards.")
    + '<div class="ss-steps" style="display:grid;'
      'grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px;">'
    + _step_card(1, "Take a photo",
                 "Upload a picture or use your camera. Even lighting and a clean, "
                 "makeup-free face give the most reliable reading.", IMG["step_scan"])
    + _step_card(2, "Get your reading",
                 "You see the most likely condition, a confidence score, a severity band "
                 "and the full breakdown across all seven categories.", IMG["step_read"])
    + _step_card(3, "Follow your routine",
                 "A morning and evening routine built around the active ingredients that "
                 "matter for your result, with a tip for every step.", IMG["step_plan"])
    + '</div></div>'

    # ── conditions
    '<div class="ss-reveal" style="padding:64px 0 0;">'
    + section_eyebrow("Coverage")
    + section_title("What SkinSense screens for")
    + section_lede("Seven categories, each with its own routine template and its own set of "
                   "care rules. Every result shows how the other six scored too.")
    + build_condition_chips()
    + '</div>'

    # ── progress / before & after
    '<div id="ss-progress" class="ss-reveal" style="padding:64px 0 0;">'
    '<div style="background:' + FOREST + ';border-radius:26px;padding:46px 46px 40px;'
    'position:relative;overflow:hidden;" class="ss-dark-panel">'
    '<div style="position:absolute;inset:0;background:radial-gradient(circle at 88% 8%,'
    'rgba(176,122,74,0.35),transparent 58%);"></div>'
    '<div style="position:relative;">'
    + section_eyebrow("Progress tracking", dark=True)
    + section_title("Your own before and after", dark=True)
    + section_lede("Skin changes too slowly to judge from memory. SkinSense keeps your first "
                   "scan as a baseline and puts it side by side with your most recent one, so "
                   "you are comparing photographs instead of impressions.", dark=True)

    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));'
      'gap:18px;margin-bottom:34px;">'
      '<div style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.14);'
      'border-radius:16px;padding:20px;">'
      '<div style="font-size:0.9rem;font-weight:700;color:#fff;margin-bottom:7px;">'
      'Baseline is kept for you</div>'
      '<p style="font-size:0.82rem;color:#D9C4AE;line-height:1.65;margin:0;">Your first scan is '
      'held as the reference shot. Every later scan is compared against it.</p></div>'
      '<div style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.14);'
      'border-radius:16px;padding:20px;">'
      '<div style="font-size:0.9rem;font-weight:700;color:#fff;margin-bottom:7px;">'
      'Confidence trend</div>'
      '<p style="font-size:0.82rem;color:#D9C4AE;line-height:1.65;margin:0;">Each check-in is '
      'plotted so you can see whether the signal is easing off or holding.</p></div>'
      '<div style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.14);'
      'border-radius:16px;padding:20px;">'
      '<div style="font-size:0.9rem;font-weight:700;color:#fff;margin-bottom:7px;">'
      'Streaks that mean something</div>'
      '<p style="font-size:0.82rem;color:#D9C4AE;line-height:1.65;margin:0;">Routines only work '
      'when repeated. Your streak counts the days you actually kept it up.</p></div>'
      '</div>'

    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:560px;">'
      + _ba_slot("Your first scan", "Kept as the reference the moment you first analyse", "ba1")
      + _ba_slot("Your latest scan", "Replaced each time you come back and scan again", "ba2")
      + '</div>'
      '<p style="font-size:0.72rem;color:#B89B7E;margin:14px 0 0;max-width:560px;'
      'line-height:1.6;">These panels fill with your own photographs once you sign in and '
      'scan. SkinSense never shows you someone else&rsquo;s skin as if it were your result.</p>'
    + '</div></div></div>'

    # ── about
    '<div id="ss-about" class="ss-reveal" style="padding:64px 0 0;">'
    '<div style="display:grid;grid-template-columns:0.95fr 1.05fr;gap:44px;align-items:center;" '
    'class="ss-about-grid">'
    '<div class="ss-zoomwrap" style="border-radius:24px;overflow:hidden;height:340px;'
    'box-shadow:0 20px 44px -20px rgba(59,42,32,0.34);">'
    '<img data-zoom tabindex="0" src="' + IMG["about"] + '" alt="Treatment being applied" '
    'loading="lazy" '
    'style="width:100%;height:100%;object-fit:cover;display:block;"></div>'
    '<div>'
    + section_eyebrow("About us")
    + section_title("Built to make skin advice legible")
    + '<p style="font-size:0.93rem;color:' + SUBTLE + ';line-height:1.78;margin:0 0 16px;">'
      'Most people meet their skin problem the same way: a search, a wall of contradictory '
      'advice, and a shelf of products bought on a guess. SkinSense exists to replace that '
      'first hour of guessing with something concrete — a screening result you can read, '
      'a confidence figure you can weigh, and a routine short enough to keep.</p>'
      '<p style="font-size:0.93rem;color:' + SUBTLE + ';line-height:1.78;margin:0 0 22px;">'
      'The model classifies across seven common conditions and always shows its full '
      'breakdown, because a number you cannot interrogate is not much better than a guess. '
      'We are deliberately clear about the limit: this is a screening and education tool, '
      'and it is built to hand you over to a dermatologist the moment your results suggest '
      'you need one.</p>'
    + '<div style="display:flex;flex-direction:column;gap:11px;">'
      '<div style="display:flex;gap:11px;align-items:flex-start;">'
      '<span style="color:' + EMERALD + ';font-weight:700;flex-shrink:0;">&check;</span>'
      '<span style="font-size:0.86rem;color:' + SUBTLE + ';line-height:1.6;">'
      '<b style="color:' + INK + ';">Transparent by default</b> — every score, every time.</span></div>'
      '<div style="display:flex;gap:11px;align-items:flex-start;">'
      '<span style="color:' + EMERALD + ';font-weight:700;flex-shrink:0;">&check;</span>'
      '<span style="font-size:0.86rem;color:' + SUBTLE + ';line-height:1.6;">'
      '<b style="color:' + INK + ';">Ingredient-led</b> — routines name the actives, not just brands.</span></div>'
      '<div style="display:flex;gap:11px;align-items:flex-start;">'
      '<span style="color:' + EMERALD + ';font-weight:700;flex-shrink:0;">&check;</span>'
      '<span style="font-size:0.86rem;color:' + SUBTLE + ';line-height:1.6;">'
      '<b style="color:' + INK + ';">Escalates when it should</b> — severe results are flagged for a doctor.</span></div>'
      '</div></div></div></div>'

    # ── trust strip
    '<div style="padding:56px 0 0;">'
    '<div style="background:' + PINE + ';border-radius:24px;padding:34px 30px;'
    'display:flex;justify-content:space-around;flex-wrap:wrap;gap:24px;align-items:center;">'
    + _stat("7", "Conditions screened")
    + _stat("34", "Products mapped")
    + _stat("30", "Day guided plan")
    + _stat("100%", "Free to use")
    + '</div></div>'

    # ── faq
    '<div id="ss-faq" class="ss-reveal" style="padding:64px 0 0;">'
    + section_eyebrow("FAQ")
    + section_title("Questions people ask first")
    + section_lede("If something here is not covered, the disclaimer at the bottom of every "
                   "screen is the short version: this helps you understand your skin, it does "
                   "not diagnose it.")
    + build_faq_html(FAQ_ITEMS)
    + '</div>'

    # ── footer
    '<div style="padding:56px 0 40px;margin-top:52px;border-top:1px solid ' + LINE + ';">'
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:26px;'
    'flex-wrap:wrap;">'
    + wordmark(34, "foot")
    + '<p style="font-size:0.75rem;color:' + FAINT + ';line-height:1.75;margin:0;max-width:520px;">'
      '<b style="color:' + SUBTLE + ';">Medical disclaimer.</b> SkinSense is an educational '
      'screening tool and is not a medical device. It does not diagnose, treat or cure any '
      'condition. Always consult a qualified dermatologist or physician about a skin concern, '
      'and seek care promptly if your skin is painful, bleeding, spreading or changing '
      'rapidly.</p></div></div>'

    '</div>'
)

LOGIN_ASIDE = (
    '<div class="ss-login-aside">'
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:30px;">'
    '<div class="ss-zoomwrap" style="border-radius:18px;overflow:hidden;height:150px;">'
    '<img data-zoom tabindex="0" src="' + IMG["face1"] + '" alt="Smiling portrait, clear skin" '
    'loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;"></div>'
    '<div class="ss-zoomwrap" style="border-radius:18px;overflow:hidden;height:150px;">'
    '<img data-zoom tabindex="0" src="' + IMG["routine"] + '" alt="Cleanser texture close-up" '
    'loading="lazy" '
    'style="width:100%;height:100%;object-fit:cover;display:block;"></div>'
    '</div>'
    + section_eyebrow("About SkinSense")
    + '<h3 style="font-size:1.24rem;font-weight:730;color:' + INK + ';margin:0 0 12px;'
      'letter-spacing:-0.02em;">One photo, a clear reading, a routine you can keep</h3>'
      '<p style="font-size:0.87rem;color:' + SUBTLE + ';line-height:1.72;margin:0 0 26px;">'
      'SkinSense screens your photo across seven common skin conditions, shows how confident '
      'it is, and turns the result into a morning and evening routine. Your first scan is kept '
      'as a baseline so you can see real change over weeks rather than guessing.</p>'
    + section_eyebrow("Common questions")
    + build_faq_html(FAQ_ITEMS[:5])
    + '<p style="font-size:0.72rem;color:' + FAINT + ';line-height:1.7;margin:22px 0 0;">'
      'Educational screening only — not a diagnosis, and not a substitute for a '
      'dermatologist.</p>'
    '</div>'
)


# ══════════════════════════════════════════════════════════════════════════════
# DASHBOARD HTML BUILDERS
# ══════════════════════════════════════════════════════════════════════════════
EMPTY_RESULT = (
    '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;'
    'padding:56px 22px;text-align:center;background:' + WHITE + ';border:1px dashed ' + LINE + ';'
    'border-radius:20px;min-height:270px;">'
    + logo_svg(46, "empty") +
    '<p style="font-size:0.92rem;color:' + INK + ';font-weight:650;margin:16px 0 6px;">'
    'Your reading will appear here</p>'
    '<p style="font-size:0.8rem;color:' + FAINT + ';margin:0;max-width:250px;line-height:1.6;">'
    'Add a photo on the left and press Analyse my skin.</p></div>'
)

EMPTY_PANEL_TEMPLATE = (
    '<div style="background:' + WHITE + ';border:1px solid ' + LINE + ';border-radius:20px;'
    'padding:26px;text-align:center;">'
    '<div style="font-size:0.68rem;letter-spacing:0.11em;color:' + SUBTLE + ';'
    'text-transform:uppercase;margin-bottom:12px;font-weight:700;">{title}</div>'
    '<p style="font-size:0.82rem;color:' + FAINT + ';margin:0;line-height:1.6;">{body}</p></div>'
)


def section_header(num, title, subtitle=""):
    html = (
        '<div style="display:flex;align-items:center;gap:13px;margin:0 0 16px;">'
        '<span style="width:32px;height:32px;border-radius:10px;background:' + FOREST + ';'
        'color:#fff;display:inline-flex;align-items:center;justify-content:center;'
        'font-size:0.82rem;font-weight:700;flex-shrink:0;">' + str(num) + '</span><div>'
        '<div style="font-size:1.02rem;font-weight:730;color:' + INK + ';line-height:1.2;'
        'letter-spacing:-0.015em;">' + title + '</div>'
    )
    if subtitle:
        html += ('<div style="font-size:0.77rem;color:' + SUBTLE + ';margin-top:3px;">'
                 + subtitle + '</div>')
    return html + '</div></div>'


def divider(space=26):
    return ('<div style="height:1px;background:' + LINE + ';margin:' + str(space) + 'px 0;"></div>')


def build_result_html(condition, confidence, severity, doctor, severity_note):
    cond_display = condition.replace("_", " ").title()
    conf_pct = round(confidence * 100, 1)
    uncertain = confidence < UNCERTAIN_BELOW
    sev_colors = {"mild": GOOD, "moderate": AMBER, "severe": RED}
    sev_color = sev_colors[severity]
    sev_label = severity.title()
    if condition == "normal_skin":
        sev_color, sev_label = GOOD, "None"
    if uncertain:
        sev_color, sev_label = FAINT, "Unclear"
    doctor_color = RED if doctor else GOOD
    doctor_bg = "#FBF0EE" if doctor else MINT
    doctor_text = "Consider seeing a dermatologist" if doctor else "No urgent action needed"
    uncertain_html = ""
    if uncertain:
        uncertain_html = (
            '<div style="background:#FDF6E8;border:1px solid #EBDCBB;border-radius:18px;'
            'padding:16px 20px;font-size:0.84rem;color:#8A6410;line-height:1.6;">'
            '<b>Low confidence.</b> This photo doesn&rsquo;t clearly match any of the seven '
            'categories. Retake it in even, natural light with your face centred and in '
            'focus before relying on this result.</div>'
        )

    return (
        '<div style="display:flex;flex-direction:column;gap:12px;">'
        + uncertain_html +

        # headline card
        '<div style="background:linear-gradient(135deg,' + FOREST + ' 0%,' + PINE + ' 100%);'
        'border-radius:20px;padding:30px 26px;text-align:center;position:relative;'
        'overflow:hidden;">'
        '<div style="position:absolute;inset:0;background:radial-gradient(circle at 82% 12%,'
        'rgba(176,122,74,0.42),transparent 60%);"></div><div style="position:relative;">'
        '<div style="font-size:0.64rem;letter-spacing:0.14em;color:#E6C9A3;'
        'text-transform:uppercase;margin-bottom:11px;font-weight:700;">Detected condition</div>'
        '<div style="font-size:2rem;color:#FFFFFF;font-weight:750;letter-spacing:-0.025em;">'
        + cond_display + '</div></div></div>'

        # confidence + severity
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'
        '<div style="background:' + WHITE + ';border:1px solid ' + LINE + ';border-radius:18px;'
        'padding:20px;">'
        '<div style="font-size:0.62rem;letter-spacing:0.11em;color:' + SUBTLE + ';'
        'text-transform:uppercase;margin-bottom:10px;font-weight:700;">Confidence</div>'
        '<div style="font-size:1.5rem;color:' + INK + ';font-weight:750;margin-bottom:10px;">'
        + str(conf_pct) + '%</div>'
        '<div style="background:' + FILL + ';border-radius:100px;height:6px;overflow:hidden;">'
        '<div style="width:' + str(conf_pct) + '%;height:100%;background:linear-gradient(90deg,'
        + EMERALD + ',' + JADE + ');border-radius:100px;"></div></div></div>'

        '<div style="background:' + WHITE + ';border:1px solid ' + LINE + ';border-radius:18px;'
        'padding:20px;">'
        '<div style="font-size:0.62rem;letter-spacing:0.11em;color:' + SUBTLE + ';'
        'text-transform:uppercase;margin-bottom:10px;font-weight:700;">Severity</div>'
        '<div style="display:flex;align-items:center;gap:9px;margin-top:4px;">'
        '<span style="width:9px;height:9px;border-radius:50%;background:' + sev_color + ';"></span>'
        '<span style="font-size:1.22rem;color:' + INK + ';font-weight:730;">'
        + sev_label + '</span></div></div></div>'

        # doctor flag
        '<div style="background:' + doctor_bg + ';border:1px solid ' + LINE + ';'
        'border-radius:18px;padding:17px 21px;display:flex;align-items:center;gap:12px;">'
        '<span style="width:10px;height:10px;border-radius:50%;background:' + doctor_color + ';'
        'flex-shrink:0;"></span>'
        '<span style="font-size:0.88rem;color:' + INK + ';font-weight:620;">'
        + doctor_text + '</span></div>'

        # assessment
        '<div style="background:' + WHITE + ';border:1px solid ' + LINE + ';border-radius:18px;'
        'padding:22px;">'
        '<div style="font-size:0.62rem;letter-spacing:0.11em;color:' + SUBTLE + ';'
        'text-transform:uppercase;margin-bottom:10px;font-weight:700;">Assessment</div>'
        '<p style="font-size:0.86rem;color:' + SUBTLE + ';line-height:1.7;margin:0;">'
        + severity_note + '</p></div></div>'
    )


def build_scores_html(probs, labels_map):
    sorted_probs = sorted(enumerate(probs), key=lambda x: -x[1])
    rows = ""
    for i, (idx, prob) in enumerate(sorted_probs):
        label = labels_map[idx].replace("_", " ").title()
        pct = round(prob * 100, 1)
        is_top = i == 0
        bar = ('linear-gradient(90deg,' + FOREST + ',' + EMERALD + ')') if is_top else "#E0CDB6"
        text_color = INK if is_top else SUBTLE
        weight = 700 if is_top else 450
        rows += (
            '<div style="display:grid;grid-template-columns:140px 1fr 52px;'
            'align-items:center;gap:14px;">'
            '<div style="font-size:0.81rem;color:' + text_color + ';font-weight:' + str(weight) + ';'
            'text-align:right;white-space:nowrap;">' + label + '</div>'
            '<div style="background:' + FILL + ';border-radius:100px;height:7px;overflow:hidden;">'
            '<div style="width:' + str(pct) + '%;height:100%;background:' + bar + ';'
            'border-radius:100px;"></div></div>'
            '<div style="font-size:0.79rem;color:' + text_color + ';font-weight:' + str(weight) + ';'
            'text-align:right;">' + str(pct) + '%</div></div>'
        )
    return (
        '<div style="background:' + WHITE + ';border:1px solid ' + LINE + ';border-radius:20px;'
        'padding:26px;">'
        '<div style="font-size:0.68rem;letter-spacing:0.11em;color:' + SUBTLE + ';'
        'text-transform:uppercase;margin-bottom:6px;font-weight:700;">Condition breakdown</div>'
        '<p style="font-size:0.76rem;color:' + FAINT + ';margin:0 0 20px;">How the model scored '
        'every category — read this before trusting the headline.</p>'
        '<div style="display:flex;flex-direction:column;gap:15px;">' + rows + '</div></div>'
    )


def build_routine_html(steps, time_of_day):
    if time_of_day == "morning":
        title = "Morning routine"
        icon = "&#9788;"
        accent = JADE
    else:
        title = "Evening routine"
        icon = "&#9790;"
        accent = FOREST

    cards = ""
    for step in steps:
        p = step["product"]
        ingr = ", ".join(p["key_ingredients"])
        cards += (
            '<div style="display:flex;gap:15px;background:' + FILL + ';border-radius:15px;'
            'padding:16px;border:1px solid ' + LINE + ';">'
            '<div style="width:27px;height:27px;border-radius:9px;background:' + WHITE + ';'
            'border:1px solid ' + LINE + ';color:' + FOREST + ';font-size:0.76rem;'
            'font-weight:750;display:flex;align-items:center;justify-content:center;'
            'flex-shrink:0;">' + str(step["step"]) + '</div>'
            '<div style="flex:1;min-width:0;">'
            '<div style="font-size:0.6rem;letter-spacing:0.11em;color:' + EMERALD + ';'
            'text-transform:uppercase;margin-bottom:5px;font-weight:750;">' + step["type"] + '</div>'
            '<div style="font-size:0.89rem;color:' + INK + ';font-weight:680;margin-bottom:6px;'
            'line-height:1.35;">' + p["name"] + '</div>'
            '<div style="font-size:0.73rem;color:' + EMERALD + ';margin-bottom:8px;'
            'line-height:1.5;font-weight:600;">' + ingr + '</div>'
            '<div style="font-size:0.74rem;color:' + SUBTLE + ';line-height:1.6;'
            'margin-bottom:12px;">' + step["tip"] + '</div>'
            '<div style="display:flex;justify-content:space-between;align-items:center;">'
            '<span style="font-size:0.85rem;color:' + INK + ';font-weight:700;">$'
            + str(p["price_usd"]) + '</span>'
            '<a href="' + p["url"] + '" target="_blank" rel="noopener" '
            'style="font-size:0.7rem;color:' + EMERALD + ';text-decoration:none;'
            'font-weight:650;border:1px solid ' + LINE + ';background:' + WHITE + ';'
            'padding:5px 12px;border-radius:100px;">View product</a></div></div></div>'
        )

    return (
        '<div style="background:' + WHITE + ';border:1px solid ' + LINE + ';border-radius:20px;'
        'padding:24px;height:100%;">'
        '<div style="display:flex;align-items:center;gap:9px;margin-bottom:18px;">'
        '<span style="color:' + accent + ';font-size:1rem;">' + icon + '</span>'
        '<span style="font-size:0.68rem;letter-spacing:0.11em;color:' + SUBTLE + ';'
        'text-transform:uppercase;font-weight:700;">' + title + '</span></div>'
        '<div style="display:flex;flex-direction:column;gap:11px;">' + cards + '</div></div>'
    )


def build_tips_html(tips):
    items = ""
    for tip in tips[:8]:
        items += (
            '<div style="display:flex;align-items:flex-start;gap:11px;padding:14px 16px;'
            'background:' + FILL + ';border:1px solid ' + LINE + ';border-radius:13px;">'
            '<span style="color:' + EMERALD + ';font-weight:750;flex-shrink:0;'
            'font-size:0.85rem;line-height:1.5;">&check;</span>'
            '<span style="font-size:0.82rem;color:' + SUBTLE + ';line-height:1.6;">'
            + tip + '</span></div>'
        )
    return (
        '<div style="background:' + WHITE + ';border:1px solid ' + LINE + ';border-radius:20px;'
        'padding:26px;">'
        '<div style="font-size:0.68rem;letter-spacing:0.11em;color:' + SUBTLE + ';'
        'text-transform:uppercase;margin-bottom:18px;font-weight:700;">Daily habits</div>'
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));'
        'gap:10px;">' + items + '</div></div>'
    )


def build_lifestyle_html(profile, condition):
    if not profile:
        return ""
    lifestyle = compute_lifestyle(profile)
    if lifestyle is None:
        return ""

    name = esc(profile.get("name") or "")
    greeting = (name + ", your ") if name else "Your "
    risk_colors = {"Low": GOOD, "Moderate": AMBER, "High": RED}
    risk_color = risk_colors[lifestyle["risk"]]

    if condition in ("acne", "oily_skin", "hyperpigmentation") and lifestyle["risk"] in ("Moderate", "High"):
        note = (greeting + "diet includes frequent oily, fried, or sugary food. This may be "
                "contributing to your " + condition.replace("_", " ") + ". Reducing these "
                "over the next few weeks can support clearer skin.")
    elif lifestyle["risk"] == "Low":
        note = greeting + "current diet habits look balanced and are unlikely to be worsening your skin."
    else:
        note = greeting + "diet may be playing a role in your skin condition. Consider moderating fried and sugary foods."

    bmi_html = ""
    weight = profile.get("weight")
    height = profile.get("height")
    if weight and height:
        try:
            h_m = float(height) / 100.0
            bmi = float(weight) / (h_m * h_m)
            bmi_html = (
                '<div style="margin-top:14px;padding-top:14px;border-top:1px solid ' + LINE + ';">'
                '<span style="font-size:0.78rem;color:' + FAINT + ';">Estimated BMI: </span>'
                '<span style="font-size:0.83rem;color:' + INK + ';font-weight:700;">'
                + str(round(bmi, 1)) + '</span>'
                '<span style="font-size:0.72rem;color:' + FAINT + ';"> — reference only, '
                'not a diagnosis</span></div>'
            )
        except Exception:
            bmi_html = ""

    return (
        '<div style="background:' + WHITE + ';border:1px solid ' + LINE + ';border-radius:20px;'
        'padding:26px;">'
        '<div style="display:flex;justify-content:space-between;align-items:center;'
        'margin-bottom:15px;gap:12px;flex-wrap:wrap;">'
        '<span style="font-size:0.68rem;letter-spacing:0.11em;color:' + SUBTLE + ';'
        'text-transform:uppercase;font-weight:700;">Lifestyle insight</span>'
        '<span style="font-size:0.69rem;font-weight:700;color:' + risk_color + ';'
        'background:' + FILL + ';border:1px solid ' + LINE + ';padding:5px 13px;'
        'border-radius:100px;">' + lifestyle["risk"] + ' dietary risk</span></div>'
        '<p style="font-size:0.87rem;color:' + INK + ';line-height:1.7;margin:0;">' + note + '</p>'
        + bmi_html + '</div>'
    )


def build_progress_html(baseline, latest):
    """Side-by-side comparison built only from the user's own scans."""
    if not baseline or not baseline.get("uri"):
        return (
            '<div style="background:' + WHITE + ';border:1px dashed ' + LINE + ';'
            'border-radius:20px;padding:38px 26px;text-align:center;">'
            '<div style="font-size:0.68rem;letter-spacing:0.11em;color:' + SUBTLE + ';'
            'text-transform:uppercase;margin-bottom:11px;font-weight:700;">'
            'Before &amp; after</div>'
            '<p style="font-size:0.83rem;color:' + FAINT + ';margin:0;max-width:400px;'
            'display:inline-block;line-height:1.65;">Your first scan becomes the baseline. '
            'From your second scan onward, both photos appear here side by side so you can '
            'compare like for like.</p></div>'
        )

    def panel(rec, tag, tag_bg, tag_fg):
        cond = rec.get("condition", "").replace("_", " ").title()
        conf = rec.get("confidence")
        meta = rec.get("date", "")
        if cond:
            meta = meta + " &middot; " + cond
        if conf is not None:
            meta = meta + " &middot; " + str(round(conf * 100, 1)) + "%"
        return (
            '<div style="border:1px solid ' + LINE + ';border-radius:17px;overflow:hidden;'
            'background:' + WHITE + ';">'
            '<div style="position:relative;height:230px;background:' + FILL + ';">'
            '<img src="' + rec["uri"] + '" alt="' + tag + ' scan" '
            'style="width:100%;height:100%;object-fit:cover;display:block;">'
            '<span style="position:absolute;top:11px;left:11px;background:' + tag_bg + ';'
            'color:' + tag_fg + ';font-size:0.62rem;letter-spacing:0.11em;'
            'text-transform:uppercase;font-weight:750;padding:5px 12px;border-radius:100px;">'
            + tag + '</span></div>'
            '<div style="padding:13px 16px;font-size:0.76rem;color:' + SUBTLE + ';'
            'font-weight:600;">' + meta + '</div></div>'
        )

    if not latest or latest.get("uri") == baseline.get("uri"):
        body = (
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;" class="ss-ba-grid">'
            + panel(baseline, "Baseline", FOREST, "#E6C9A3")
            + '<div style="border:1px dashed ' + LINE + ';border-radius:17px;display:flex;'
              'flex-direction:column;align-items:center;justify-content:center;padding:26px;'
              'text-align:center;min-height:230px;background:' + WHITE + ';">'
              '<p style="font-size:0.84rem;color:' + INK + ';font-weight:650;margin:0 0 6px;">'
              'Next scan goes here</p>'
              '<p style="font-size:0.78rem;color:' + FAINT + ';margin:0;line-height:1.6;'
              'max-width:210px;">Come back in a week or two and analyse again to see the '
              'two side by side.</p></div></div>'
        )
        delta_html = ""
    else:
        body = ('<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;" '
                'class="ss-ba-grid">'
                + panel(baseline, "Before", FOREST, "#E6C9A3")
                + panel(latest, "After", EMERALD, "#FFFFFF") + '</div>')

        b_conf = baseline.get("confidence")
        l_conf = latest.get("confidence")
        delta_html = ""
        if b_conf is not None and l_conf is not None:
            diff = (l_conf - b_conf) * 100
            if diff <= -3:
                msg = ("Signal for this condition is down " + str(abs(round(diff, 1)))
                       + " points since your baseline.")
                colour, bg = EMERALD, MINT
            elif diff >= 3:
                msg = ("Signal for this condition is up " + str(round(diff, 1))
                       + " points since your baseline.")
                colour, bg = AMBER, "#FDF6E8"
            else:
                msg = "Broadly unchanged since your baseline — keep going, this takes weeks."
                colour, bg = SUBTLE, FILL
            delta_html = (
                '<div style="margin-top:14px;background:' + bg + ';border:1px solid ' + LINE + ';'
                'border-radius:14px;padding:14px 18px;display:flex;align-items:center;gap:11px;">'
                '<span style="width:9px;height:9px;border-radius:50%;background:' + colour + ';'
                'flex-shrink:0;"></span>'
                '<span style="font-size:0.83rem;color:' + INK + ';font-weight:600;">'
                + msg + '</span></div>'
            )

    return (
        '<div style="background:' + WHITE + ';border:1px solid ' + LINE + ';border-radius:20px;'
        'padding:24px;">'
        '<div style="display:flex;justify-content:space-between;align-items:center;'
        'margin-bottom:16px;gap:12px;flex-wrap:wrap;">'
        '<span style="font-size:0.68rem;letter-spacing:0.11em;color:' + SUBTLE + ';'
        'text-transform:uppercase;font-weight:700;">Before &amp; after</span>'
        '<span style="font-size:0.7rem;color:' + FAINT + ';">Your own scans only</span></div>'
        + body + delta_html + '</div>'
    )


def build_dashboard_intro_html(email, profile):
    user = get_or_create_user(email)
    name = esc((profile or {}).get("name") or user.get("name") or "")
    greeting_text = ("Welcome back, " + name) if name else "Welcome back"

    streak = current_streak(user)
    longest = user.get("longest_streak", 0)

    day_txt = ""
    plan = user.get("plan")
    if plan:
        day_num = min(plan_day_number(user), 30)
        day_txt = "Day " + str(day_num) + " of 30"

    pending = pop_pending_reminder(email)

    html = '<div style="display:flex;flex-direction:column;gap:11px;">'
    html += ('<p style="font-size:0.97rem;color:' + SUBTLE + ';margin:0;font-weight:550;">'
             + greeting_text + '</p>')

    html += '<div style="display:flex;gap:9px;align-items:center;flex-wrap:wrap;">'
    plural = "s" if streak != 1 else ""
    html += (
        '<span style="display:inline-flex;align-items:center;gap:6px;background:' + MINT + ';'
        'border:1px solid ' + LINE + ';padding:6px 14px;border-radius:100px;font-size:0.78rem;'
        'color:' + PINE + ';font-weight:700;">\U0001F525 ' + str(streak) + ' day' + plural
        + ' streak</span>'
    )
    if longest > streak:
        html += ('<span style="font-size:0.73rem;color:' + FAINT + ';font-weight:600;">Best: '
                 + str(longest) + ' days</span>')
    if day_txt:
        html += (
            '<span style="display:inline-flex;align-items:center;background:' + FILL + ';'
            'border:1px solid ' + LINE + ';padding:6px 14px;border-radius:100px;'
            'font-size:0.78rem;color:' + INK + ';font-weight:700;">' + day_txt + '</span>'
        )
    html += '</div>'

    if pending:
        html += (
            '<div style="background:#FDF6E8;border:1px solid #EBDCBB;border-radius:13px;'
            'padding:12px 16px;font-size:0.83rem;color:#8A6410;">' + esc(pending) + '</div>'
        )

    if user.get("flagged_for_doctor"):
        html += (
            '<div style="background:#FBF0EE;border:1px solid #EACCC6;border-radius:13px;'
            'padding:12px 16px;font-size:0.83rem;color:' + RED + ';font-weight:600;">'
            'Based on your recent check-ins, we recommend seeing a dermatologist soon.</div>'
        )

    return html + '</div>'


def build_history_html(email):
    if not email:
        return EMPTY_PANEL_TEMPLATE.format(title="Check-in history",
                                           body="Sign in to see your history.")
    users = load_users()
    user = users.get(email.strip().lower())
    if not user or not user.get("plan") or not user["plan"].get("checkins"):
        return EMPTY_PANEL_TEMPLATE.format(
            title="Check-in history",
            body="Your check-in history will appear here once you analyse your skin."
        )

    checkins = user["plan"]["checkins"]
    recent = checkins[-10:]
    # Compare like with like: only check-ins for the condition you're tracking now.
    latest_cond = checkins[-1]["condition"]
    same = [c for c in checkins if c["condition"] == latest_cond]
    delta = same[-1]["confidence"] - same[0]["confidence"]
    if latest_cond == "normal_skin":
        delta = -delta   # a stronger "normal" signal is the good direction

    if len(same) >= 2:
        if delta < -0.03:
            trend_text, trend_color = "Trending better", GOOD
        elif delta > 0.03:
            trend_text, trend_color = "Trending worse", RED
        else:
            trend_text, trend_color = "Holding steady", AMBER
    else:
        trend_text, trend_color = "First check-in recorded", SUBTLE

    rows = ""
    for c in reversed(recent):
        pct = round(c["confidence"] * 100, 1)
        rows += (
            '<div style="display:grid;grid-template-columns:96px 1fr 54px;'
            'align-items:center;gap:12px;padding:9px 0;">'
            '<span style="font-size:0.74rem;color:' + SUBTLE + ';font-weight:600;">'
            + c["date"] + '</span>'
            '<div style="background:' + FILL + ';border-radius:100px;height:6px;overflow:hidden;">'
            '<div style="width:' + str(pct) + '%;height:100%;background:linear-gradient(90deg,'
            + FOREST + ',' + JADE + ');border-radius:100px;"></div></div>'
            '<span style="font-size:0.74rem;color:' + SUBTLE + ';text-align:right;'
            'font-weight:600;">' + str(pct) + '%</span></div>'
        )

    return (
        '<div style="background:' + WHITE + ';border:1px solid ' + LINE + ';border-radius:20px;'
        'padding:26px;">'
        '<div style="display:flex;justify-content:space-between;align-items:center;'
        'margin-bottom:5px;gap:12px;flex-wrap:wrap;">'
        '<span style="font-size:0.68rem;letter-spacing:0.11em;color:' + SUBTLE + ';'
        'text-transform:uppercase;font-weight:700;">Check-in history</span>'
        '<span style="font-size:0.73rem;color:' + trend_color + ';font-weight:700;">'
        + trend_text + '</span></div>'
        '<p style="font-size:0.73rem;color:' + FAINT + ';margin:0 0 16px;">'
        'Condition confidence across your recent check-ins</p>' + rows + '</div>'
    )


def build_admin_table_html():
    rows = get_all_users_summary()
    if not rows:
        return ('<div style="background:' + WHITE + ';border:1px solid ' + LINE + ';'
                'border-radius:20px;padding:34px;text-align:center;color:' + FAINT + ';'
                'font-size:0.86rem;">No users yet.</div>')

    body = ""
    for r in rows:
        colour = RED if r["flagged"] else GOOD
        dot = ('<span style="width:9px;height:9px;border-radius:50%;background:' + colour + ';'
               'display:inline-block;"></span>')
        last_txt = (str(r["days_ago"]) + "d ago") if r["days_ago"] is not None else "never"
        body += (
            '<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 0.6fr;gap:10px;'
            'align-items:center;padding:13px 0;border-bottom:1px solid ' + LINE + ';'
            'font-size:0.83rem;">'
            '<span style="color:' + INK + ';font-weight:600;">' + esc(r["name"])
            + ' <span style="color:' + FAINT + ';font-size:0.72rem;font-weight:400;">('
            + esc(r["email"]) + ')</span></span>'
            '<span style="color:' + SUBTLE + ';">\U0001F525 ' + str(r["streak"]) + '</span>'
            '<span style="color:' + SUBTLE + ';">' + last_txt + '</span>'
            '<span style="color:' + SUBTLE + ';">Day ' + str(r["day_in_plan"]) + '</span>'
            + dot + '</div>'
        )

    header = (
        '<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 0.6fr;gap:10px;'
        'padding-bottom:11px;border-bottom:2px solid ' + FOREST + ';font-size:0.68rem;'
        'letter-spacing:0.09em;text-transform:uppercase;color:' + SUBTLE + ';font-weight:750;">'
        '<span>User</span><span>Streak</span><span>Last active</span><span>Plan</span>'
        '<span>Flag</span></div>'
    )
    return ('<div style="background:' + WHITE + ';border:1px solid ' + LINE + ';'
            'border-radius:20px;padding:26px;">' + header + body + '</div>')


# ══════════════════════════════════════════════════════════════════════════════
# ACTIONS
# ══════════════════════════════════════════════════════════════════════════════
@torch.no_grad()
def analyse_skin(image, profile, email, baseline):
    blank = (EMPTY_RESULT, "", "", "", "", "", gr.update(), gr.update(),
             baseline, gr.update())
    if image is None:
        return blank

    try:
        img_bgr = pil_to_bgr(image)
        if img_bgr is None:
            err = ('<div style="background:#FBF0EE;border:1px solid #EACCC6;border-radius:18px;'
                   'padding:22px;color:' + RED + ';font-size:0.88rem;">'
                   'Could not read that image. Try a different photo.</div>')
            return (err, "", "", "", "", "", gr.update(), gr.update(), baseline, gr.update())

        tensor_np = processor.process(img_bgr)
        tensor = torch.from_numpy(tensor_np).unsqueeze(0).to(config.DEVICE)
        logits = model(tensor)
        probs = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()
        top_idx = int(np.argmax(probs))
        condition = labels[top_idx]
        confidence = float(probs[top_idx])
        severity = get_severity(confidence, condition)
        doctor = should_see_doctor(condition, severity, confidence)
        routine = build_routine(condition, severity)

        result_html = build_result_html(condition, confidence, severity,
                                        doctor, routine["severity_note"])
        scores_html = build_scores_html(probs, labels)
        morning_html = build_routine_html(routine["morning"], "morning")
        night_html = build_routine_html(routine["night"], "night")
        tips_html = build_tips_html(routine["general_tips"])
        lifestyle_html = build_lifestyle_html(profile, condition)

        # ── before / after, built only from this user's own scans
        snapshot = {
            "uri": to_data_uri(image),
            "date": today_str(),
            "condition": condition,
            "confidence": confidence,
        }
        if baseline and baseline.get("uri"):
            new_baseline = baseline
        else:
            new_baseline = snapshot
        progress_html = build_progress_html(new_baseline, snapshot)

        greeting_update = gr.update()
        history_update = gr.update()
        if email:
            record_analysis(email, condition, confidence, severity)
            greeting_update = build_dashboard_intro_html(email, profile)
            history_update = build_history_html(email)

        return (result_html, scores_html, morning_html, night_html, tips_html,
                lifestyle_html, greeting_update, history_update,
                new_baseline, progress_html)

    except Exception as e:
        import traceback
        traceback.print_exc()
        err = ('<div style="background:#FBF0EE;border:1px solid #EACCC6;border-radius:18px;'
               'padding:22px;color:' + RED + ';font-size:0.88rem;">Something went wrong: '
               + esc(e) + '</div>')
        return (err, "", "", "", "", "", gr.update(), gr.update(), baseline, gr.update())


def reset_baseline_fn():
    return None, build_progress_html(None, None)


def mark_routine_done_fn(email):
    if not email:
        return gr.update()
    record_routine_done(email)
    return build_dashboard_intro_html(email, {})


# ── Auth / navigation ───────────────────────────────────────────────────────────
def go_to_login():
    return gr.update(visible=False), gr.update(visible=True)


# Screen changes only ever touch the screen being left and the one being entered.
# Gradio 6 mounts a hidden screen lazily; a "hide" sent to a screen that has never
# been shown sticks, and a later "show" then leaves the page blank. So screens that
# aren't changing always get a no-op gr.update(), never visible=False.
def go_to_landing():
    return gr.update(visible=True), gr.update(visible=False)


def send_otp_wrapper(email):
    """Returns: pending_email, login_screen, otp_screen, login_status.
    The code itself never leaves the server."""
    email = (email or "").strip().lower()
    if not email or "@" not in email or len(email) > 254:
        return ("", gr.update(), gr.update(),
                status_note("Enter a valid email address.", bad=True))
    ok, err = issue_otp(email)
    if not ok:
        return ("", gr.update(), gr.update(), status_note(err, bad=True))
    return (email, gr.update(visible=False), gr.update(visible=True), "")


# A screen's contents are filled in by a follow-up step chained with .then(), never
# by the event that first shows the screen: Gradio 6 builds a hidden screen lazily,
# and outputs built mid-event stay stuck in the dimmed "pending" state.
def otp_sent_note(pending_email):
    if not pending_email:
        return gr.update()
    return status_note("We sent a 6-digit code to " + esc(pending_email)
                       + " — check your inbox.")


def populate_after_signin(email, profile):
    """Returns: greeting, history, admin_table, admin_user_select for whichever
    screen verify_otp_wrapper just opened."""
    keep = (gr.update(), gr.update(), gr.update(), gr.update())
    if not email:
        return keep
    if is_admin(email):
        choices = [r["email"] for r in get_all_users_summary()]
        return gr.update(), gr.update(), build_admin_table_html(), gr.update(choices=choices)
    with USERS_LOCK:
        user = load_users().get(email.strip().lower()) or {}
    if not (user.get("profile_done") or user.get("profile")):
        return keep   # new user: the profile screen comes first
    return (build_dashboard_intro_html(email, profile or {}), build_history_html(email),
            gr.update(), gr.update())


def populate_dashboard(email, profile):
    if not email:
        return gr.update(), gr.update()
    return build_dashboard_intro_html(email, profile or {}), build_history_html(email)


def resend_otp_wrapper(pending_email):
    if not pending_email:
        return status_note("Go back and enter your email first.", bad=True)
    ok, err = issue_otp(pending_email)
    if not ok:
        return status_note(err, bad=True)
    return status_note("We sent a new code to " + esc(pending_email) + ".")


def status_note(text, bad=False):
    colour = RED if bad else PINE
    bg = "#FBF0EE" if bad else MINT
    border = "#EACCC6" if bad else LINE
    return ('<div style="background:' + bg + ';border:1px solid ' + border + ';'
            'border-radius:12px;padding:11px 15px;font-size:0.81rem;color:' + colour + ';'
            'font-weight:600;">' + text + '</div>')


def verify_otp_wrapper(entered, pending_email):
    """Returns: otp_screen, profile_screen, main_screen, admin_screen, verify_status,
    current_email, profile_state, otp_input, otp_status_display; populate_after_signin
    fills the new screen. The signed-in email is the one the code was sent to — never a
    client-supplied value. Leaving the screen clears its "we sent a code to" note, so the
    next person to sign in on this browser never sees the previous address."""
    stay = (gr.update(), gr.update(), gr.update(), gr.update())
    if not (entered or "").strip():
        return stay + (status_note("Enter the 6-digit code.", bad=True), "", {}, gr.update(),
                       gr.update())
    ok, err = check_otp(pending_email, entered)
    if not ok:
        return stay + (status_note(err, bad=True), "", {}, gr.update(), gr.update())

    email = pending_email
    user = record_login(email)
    leave_otp = gr.update(visible=False)

    if is_admin(email):
        return (leave_otp, gr.update(), gr.update(), gr.update(visible=True),
                "", email, {}, "", "")

    profile = user.get("profile") or {}
    if user.get("profile_done") or profile:
        # returning user — straight to the dashboard
        return (leave_otp, gr.update(), gr.update(visible=True), gr.update(),
                "", email, profile, "", "")

    return (leave_otp, gr.update(visible=True), gr.update(), gr.update(),
            "", email, {}, "", "")


def back_to_login():
    """Returns: login_screen, otp_screen, otp_status_display (cleared on the way out)."""
    return gr.update(visible=True), gr.update(visible=False), ""


def save_profile_fn(email, name, age, weight, height, oily, fastfood, foodtype, sweets, sweet_qty):
    if not email:
        return {}, gr.update(), gr.update()
    profile = {
        "name": (name or "").strip(),
        "age": age,
        "weight": weight,
        "height": height,
        "oily_food": oily,
        "fast_food": fastfood,
        "food_type": foodtype,
        "sweets": sweets,
        "sweet_qty": sweet_qty,
    }
    persist_profile_to_db(email, profile)
    return profile, gr.update(visible=False), gr.update(visible=True)


def skip_profile_fn(email):
    if not email:
        return {}, gr.update(), gr.update()
    persist_profile_to_db(email, {})
    return {}, gr.update(visible=False), gr.update(visible=True)


def logout_fn():
    """Wired separately to the dashboard and the admin console, so it only hides the
    screen the user is actually on: landing, current screen, then session state."""
    return gr.update(visible=True), gr.update(visible=False), {}, "", None, ""


# Admin actions re-check the signed-in session on every call. current_email is
# server-side session state set only by a verified code, so it can't be spoofed.
DEFAULT_REMINDER = "We miss you at SkinSense! Come back and keep your streak alive."
STREAK_NUDGE = ("You did your routine yesterday. Two minutes today keeps your streak going, "
                "and consistency is what actually changes skin.")


def refresh_admin_fn(current):
    if not is_admin(current):
        return "", gr.update(choices=[])
    choices = [r["email"] for r in get_all_users_summary()]
    return build_admin_table_html(), gr.update(choices=choices)


def reminder_params(email, message):
    """Template variables for the reminder email, written around the user's streak."""
    with USERS_LOCK:
        user = dict(load_users().get(email.strip().lower()) or {})
    streak = current_streak(user)
    best = max(user.get("longest_streak", 0), streak)
    if streak >= 2:
        headline = "Keep your " + str(streak) + "-day streak going"
        line = ("You've kept your routine up " + str(streak) + " days in a row. "
                "Today's routine keeps the streak alive.")
    elif streak == 1:
        headline = "Make it two days in a row"
        line = "You did your routine yesterday. Do it again today and you've started a streak."
    elif best >= 2:
        headline = "Pick your streak back up"
        line = ("Your best run so far is " + str(best) + " days. "
                "One routine today starts a new one.")
    else:
        headline = "Your skin plan is waiting"
        line = "Routines work when they're repeated. Two minutes today is a strong start."
    return {
        "to_email": email,
        "name": (user.get("name") or "").strip() or "there",
        "message": message,
        "headline": headline,
        "streak": str(streak),
        "best_streak": str(best),
        "streak_line": line,
        "app_url": APP_URL,
    }


def _deliver_reminders(targets, message):
    sent = 0
    for i, e in enumerate(targets):
        queue_reminder(e, message)
        if i:
            time.sleep(1.1)   # EmailJS allows about one request per second
        if send_email(EMAILJS_REMINDER_TEMPLATE_ID, reminder_params(e, message)):
            sent += 1
    return sent


def streak_reminder_targets():
    """People who did their routine yesterday but not yet today, and haven't been
    nudged today. Marks them as nudged so each person gets at most one a day."""
    today = today_str()
    yesterday = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
    targets = []
    with USERS_LOCK:
        for email, u in load_users().items():
            if (u.get("last_active") == yesterday and u.get("streak", 0) >= 1
                    and u.get("last_streak_reminder") != today):
                u["last_streak_reminder"] = today
                targets.append(email)
        if targets:
            save_users()
    return targets


def _streak_reminder_loop():
    while True:
        time.sleep(600)
        if datetime.datetime.now(datetime.timezone.utc).hour < STREAK_REMINDER_HOUR_UTC:
            continue
        targets = streak_reminder_targets()
        if targets:
            sent = _deliver_reminders(targets, STREAK_NUDGE)
            print("Streak reminders: " + str(sent) + "/" + str(len(targets)) + " emailed.")


if STREAK_REMINDERS:
    threading.Thread(target=_streak_reminder_loop, daemon=True).start()
    print("Streak reminders on: daily after " + str(STREAK_REMINDER_HOUR_UTC) + ":00 UTC.")


def send_reminder_fn(current, selected_email, message):
    if not is_admin(current):
        return status_note("Not authorised.", bad=True), ""
    if not selected_email:
        return status_note("Select a user first.", bad=True), build_admin_table_html()
    final_message = (message or "").strip() or DEFAULT_REMINDER
    if _deliver_reminders([selected_email], final_message):
        note = status_note("Reminder queued and emailed to " + esc(selected_email) + ".")
    else:
        note = status_note("Reminder queued for " + esc(selected_email)
                           + ", but the email could not be sent.", bad=True)
    return note, build_admin_table_html()


def send_bulk_reminder_fn(current, message):
    if not is_admin(current):
        return status_note("Not authorised.", bad=True), ""
    final_message = (message or "").strip() or DEFAULT_REMINDER
    rows = get_all_users_summary()
    targets = [r["email"] for r in rows if r["days_ago"] is not None and r["days_ago"] >= 3]
    if not targets:
        return status_note("No inactive users found (3+ days)."), build_admin_table_html()
    sent = _deliver_reminders(targets, final_message)
    return (status_note("Queued reminders for " + str(len(targets)) + " inactive user(s); "
                        + str(sent) + " emailed."), build_admin_table_html())


def remove_user_fn(current, selected_email, confirmed):
    """Returns: admin_remove_status, admin_table_output, admin_user_select,
    admin_remove_confirm."""
    if not is_admin(current):
        return status_note("Not authorised.", bad=True), "", gr.update(), gr.update()
    keep_table = build_admin_table_html()
    if not selected_email:
        return (status_note("Select a user first.", bad=True), keep_table,
                gr.update(), gr.update())
    if is_admin(selected_email):
        return (status_note("The admin account can't be removed.", bad=True), keep_table,
                gr.update(), gr.update())
    if not confirmed:
        return (status_note("Tick the box to confirm removing " + esc(selected_email) + ".",
                            bad=True), keep_table, gr.update(), gr.update())
    if delete_user(selected_email):
        note = status_note("Removed " + esc(selected_email) + ".")
    else:
        note = status_note(esc(selected_email) + " was already gone.", bad=True)
    choices = [r["email"] for r in get_all_users_summary()]
    return (note, build_admin_table_html(), gr.update(choices=choices, value=None),
            gr.update(value=False))


# ══════════════════════════════════════════════════════════════════════════════
# CSS — espresso / coffee / tan / cream
# ══════════════════════════════════════════════════════════════════════════════
CSS = """
* { box-sizing: border-box; }

.gradio-container {
    background: #FAF5EE !important;
    max-width: 1240px !important;
    margin: 0 auto !important;
    padding: 0 !important;
    font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI',
                 'Helvetica Neue', sans-serif !important;
    -webkit-font-smoothing: antialiased;
}

html, body, .dark, .gradio-container, gradio-app {
    --font: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
    --font-mono: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace !important;
    --background-fill-primary: #FFFFFF !important;
    --background-fill-secondary: #FAF5EE !important;
    --body-background-fill: #FAF5EE !important;
    --block-background-fill: #FFFFFF !important;
    --border-color-primary: #E9DCCB !important;
    --input-background-fill: #F6EEE3 !important;
    --body-text-color: #2A1D15 !important;
    --body-text-color-subdued: #6E5645 !important;
    --block-label-text-color: #2A1D15 !important;
    --block-title-text-color: #2A1D15 !important;
    --color-accent: #8A5A36 !important;
    --color-accent-soft: #F3E8DA !important;
    --neutral-700: #2A1D15 !important;
    --neutral-500: #6E5645 !important;
}

body, .main { background: #FAF5EE !important; }
footer { display: none !important; }

.block { background: transparent !important; border: none !important; padding: 0 !important; }
.panel { background: transparent !important; }

.ss-wide {
    max-width: 1180px;
    margin: 0 auto;
    padding: 0 22px;
}

/* ── details / summary (FAQ) ─────────────────────────────────────────── */
summary::-webkit-details-marker { display: none; }
summary::marker { content: ""; }
details summary span:last-child {
    display: inline-block;
    transition: transform 0.18s ease;
}
details[open] summary span:last-child { transform: rotate(45deg); }
details[open] summary { padding-bottom: 6px !important; }

/* ── auth cards ──────────────────────────────────────────────────────── */
.ss-narrow  { max-width: 440px !important; margin: 0 auto !important; }
.ss-medium  { max-width: 640px !important; margin: 0 auto !important; }

.ss-auth-card {
    background: #FFFFFF;
    border: 1px solid #E9DCCB;
    border-radius: 22px;
    padding: 34px 32px 10px;
    box-shadow: 0 14px 38px -22px rgba(59,42,32,0.30);
}
.ss-login-aside {
    background: #FFFFFF;
    border: 1px solid #E9DCCB;
    border-radius: 22px;
    padding: 26px 28px 30px;
}

/* ── labels & inputs ─────────────────────────────────────────────────── */
.gradio-container label,
.gradio-container label > span,
.gradio-container legend,
.gradio-container .gr-block > label,
.gradio-container [data-testid="block-label"],
.gradio-container [data-testid="block-info"],
.gradio-container .block-title,
.gradio-container .form label,
.gradio-container fieldset > span,
.gradio-container fieldset label span {
    color: #2A1D15 !important;
    font-size: 0.88rem !important;
    font-weight: 650 !important;
    opacity: 1 !important;
    -webkit-text-fill-color: #2A1D15 !important;
}

.gradio-container input[type="text"],
.gradio-container input[type="number"],
.gradio-container textarea,
.gradio-container select {
    background: #F6EEE3 !important;
    border: 1px solid #E9DCCB !important;
    border-radius: 13px !important;
    color: #2A1D15 !important;
    font-size: 0.92rem !important;
    padding: 13px 15px !important;
}

.gradio-container input:focus,
.gradio-container textarea:focus,
.gradio-container select:focus {
    border-color: #8A5A36 !important;
    box-shadow: 0 0 0 3px rgba(138,90,54,0.13) !important;
    outline: none !important;
}

.gradio-container fieldset { border: none !important; background: transparent !important; }
.gradio-container .wrap label { color: #2A1D15 !important; font-weight: 500 !important; }
.gradio-container .form > .block,
.gradio-container .form > .gap > .block { margin-bottom: 17px !important; }

.gradio-container input[type="radio"]:checked,
.gradio-container input[type="checkbox"]:checked {
    accent-color: #8A5A36 !important;
}

/* ── sleek pass: kill Gradio's tinted label bands and heavy chrome ───── */
/* Gradio wraps every field in a filled, bordered block; on a designed     */
/* page that reads as a stray green slab behind the label. Strip it.       */
.gradio-container .block,
.gradio-container .form,
.gradio-container .panel,
.gradio-container .gr-box,
.gradio-container .gr-form,
.gradio-container [data-testid="block-label"],
.gradio-container .container > .wrap > label {
    background: transparent !important;
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

/* labels: quiet, tight, no slab */
.gradio-container label,
.gradio-container label > span,
.gradio-container .block-title,
.gradio-container [data-testid="block-label"] {
    background: transparent !important;
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 0 8px 2px !important;
    margin: 0 !important;
    font-size: 0.79rem !important;
    font-weight: 620 !important;
    letter-spacing: 0.005em !important;
    line-height: 1.35 !important;
    color: #4A3528 !important;
    -webkit-text-fill-color: #4A3528 !important;
    text-transform: none !important;
}

/* inputs: white field, hairline rule, generous padding */
.gradio-container input[type="text"],
.gradio-container input[type="number"],
.gradio-container input[type="email"],
.gradio-container textarea,
.gradio-container select {
    background: #FFFFFF !important;
    border: 1px solid #EADFD0 !important;
    border-radius: 12px !important;
    padding: 13px 16px !important;
    font-size: 0.95rem !important;
    line-height: 1.4 !important;
    color: #2A1D15 !important;
    box-shadow: none !important;
    transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
}
.gradio-container input::placeholder,
.gradio-container textarea::placeholder {
    color: #B7A290 !important;
    opacity: 1 !important;
}

/* radios / checkboxes: readable, evenly spaced, no slab */
.gradio-container .wrap label,
.gradio-container fieldset label {
    background: transparent !important;
    border: none !important;
    padding: 5px 0 !important;
    font-size: 0.88rem !important;
    font-weight: 480 !important;
    color: #4A3528 !important;
    -webkit-text-fill-color: #4A3528 !important;
}

/* dropdown surface */
.gradio-container .wrap-inner,
.gradio-container .secondary-wrap {
    background: #FFFFFF !important;
    border-radius: 12px !important;
}

/* even rhythm between fields */
.gradio-container .form > .block,
.gradio-container .form > .gap > .block { margin-bottom: 18px !important; }
.gradio-container .gap { gap: 16px !important; }

/* ── buttons ─────────────────────────────────────────────────────────── */
.ss-cta-row { max-width: 320px !important; margin: -6px 0 4px !important; }

.ss-cta-btn button,
button.ss-cta-btn {
    width: 100% !important;
    background: linear-gradient(135deg, #3B2A20 0%, #8A5A36 100%) !important;
    color: #FFFFFF !important;
    border: none !important;
    border-radius: 100px !important;
    font-size: 0.94rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.01em !important;
    padding: 17px 30px !important;
    box-shadow: 0 12px 26px -12px rgba(59,42,32,0.55) !important;
    transition: transform 0.12s ease, box-shadow 0.18s ease !important;
}
.ss-cta-btn button:hover,
button.ss-cta-btn:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 16px 32px -12px rgba(59,42,32,0.62) !important;
}

.ss-primary-btn button,
button.ss-primary-btn {
    width: 100% !important;
    background: #3B2A20 !important;
    color: #FFFFFF !important;
    border: none !important;
    border-radius: 100px !important;
    font-size: 0.87rem !important;
    font-weight: 680 !important;
    padding: 14px 24px !important;
    transition: background 0.15s ease, transform 0.1s ease !important;
}
.ss-primary-btn button:hover,
button.ss-primary-btn:hover { background: #5A3E2B !important; }
.ss-primary-btn button:active,
button.ss-primary-btn:active { transform: scale(0.985) !important; }

.ss-ghost-btn button,
button.ss-ghost-btn {
    width: 100% !important;
    background: #FFFFFF !important;
    color: #3B2A20 !important;
    border: 1px solid #E9DCCB !important;
    border-radius: 100px !important;
    font-size: 0.84rem !important;
    font-weight: 620 !important;
    padding: 12px 24px !important;
}
.ss-ghost-btn button:hover,
button.ss-ghost-btn:hover { background: #F3E8DA !important; border-color: #8A5A36 !important; }

.ss-link-btn button,
button.ss-link-btn {
    background: transparent !important;
    color: #6E5645 !important;
    border: none !important;
    font-size: 0.79rem !important;
    font-weight: 600 !important;
    text-decoration: underline !important;
    padding: 7px !important;
    box-shadow: none !important;
}
.ss-link-btn button:hover,
button.ss-link-btn:hover { color: #8A5A36 !important; }

#ss-analyse-btn button,
button#ss-analyse-btn {
    width: 100% !important;
    background: linear-gradient(135deg, #3B2A20 0%, #8A5A36 100%) !important;
    color: #FFFFFF !important;
    border: none !important;
    border-radius: 100px !important;
    font-size: 0.9rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.015em !important;
    padding: 16px 24px !important;
    box-shadow: 0 10px 22px -12px rgba(59,42,32,0.55) !important;
}
#ss-analyse-btn button:hover,
button#ss-analyse-btn:hover { opacity: 0.93 !important; }

/* ── kill Gradio's built-in progress tracker ─────────────────────────── */
/* the "processing | 0.0/0.0s" readout, the eta bar and the Gradio        */
/* watermark that Gradio 6 overlays on a component while a function runs  */
.gradio-container .meta-text,
.gradio-container .meta-text-center,
.gradio-container .progress-text,
.gradio-container .eta-bar,
.gradio-container .progress-level,
.gradio-container .progress-level-inner,
.gradio-container .clear-status {
    display: none !important;
}

.gradio-container .wrap.generating,
.gradio-container .wrap.loading {
    opacity: 0 !important;
    background: transparent !important;
    pointer-events: none !important;
}

.gradio-container .generating {
    border-color: transparent !important;
    box-shadow: none !important;
}

/* ── upload zone ─────────────────────────────────────────────────────── */
.ss-upload .wrap {
    background: #F6EEE3 !important;
    border: 1.6px dashed #D2B895 !important;
    border-radius: 17px !important;
    color: #6E5645 !important;
}
.ss-upload .wrap:hover { border-color: #8A5A36 !important; background: #F3E8DA !important; }

/* ── Vercel-style craft ──────────────────────────────────────────────── */
.ss-dotgrid {
    position: absolute; inset: -20px -60px 0; z-index: 0; pointer-events: none;
    background-image: radial-gradient(rgba(59,42,32,0.10) 1px, transparent 1px);
    background-size: 22px 22px;
    -webkit-mask-image: radial-gradient(ellipse at 30% 30%, #000 30%, transparent 75%);
            mask-image: radial-gradient(ellipse at 30% 30%, #000 30%, transparent 75%);
}
.ss-hero-grid > *:not(.ss-dotgrid) { position: relative; z-index: 1; }

.ss-nav a { position: relative; white-space: nowrap; transition: color 0.15s ease; }
.ss-nav a:hover { color: #2A1D15 !important; }
.ss-nav a::after {
    content: ""; position: absolute; left: 0; right: 0; bottom: -5px; height: 1px;
    background: #8A5A36; transform: scaleX(0); transform-origin: left;
    transition: transform 0.22s ease;
}
.ss-nav a:hover::after { transform: scaleX(1); }

/* cards lift on hover */
.ss-card { transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
.ss-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 40px -22px rgba(59,42,32,0.45);
    border-color: #D9C4AE !important;
}

/* zoomable photos */
img[data-zoom] { cursor: zoom-in; transition: transform 0.6s cubic-bezier(.2,.7,.2,1); }
.ss-zoomwrap:hover img[data-zoom] { transform: scale(1.045); }
img[data-zoom]:focus-visible { outline: 2px solid #8A5A36; outline-offset: -4px; }

/* hero slideshow: three photos cross-fade with a progress bar per slide */
.ss-slides { position: absolute; inset: 0; }
.ss-slides img {
    position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
    opacity: 0; animation: ss-fade 15s infinite;
}
.ss-slides img:nth-child(2) { animation-delay: 5s; }
.ss-slides img:nth-child(3) { animation-delay: 10s; }
.ss-zoomwrap:hover .ss-slides img { transform: none; }
@keyframes ss-fade {
    0%   { opacity: 0; transform: scale(1.07); }
    5%   { opacity: 1; }
    33%  { opacity: 1; }
    39%  { opacity: 0; transform: scale(1); }
    100% { opacity: 0; }
}
.ss-slide-dots { position: absolute; left: 16px; bottom: 16px; display: flex; gap: 6px; z-index: 2; }
.ss-slide-dots span {
    position: relative; width: 22px; height: 3px; border-radius: 3px; overflow: hidden;
    background: rgba(255,253,249,0.45);
}
.ss-slide-dots span::after {
    content: ""; position: absolute; inset: 0; background: #FFFDF9;
    transform: scaleX(0); transform-origin: left; animation: ss-dot 15s linear infinite;
}
.ss-slide-dots span:nth-child(2)::after { animation-delay: 5s; }
.ss-slide-dots span:nth-child(3)::after { animation-delay: 10s; }
@keyframes ss-dot {
    0% { transform: scaleX(0); } 33.3% { transform: scaleX(1); } 33.4%, 100% { transform: scaleX(0); }
}
.ss-float { animation: ss-bob 6s ease-in-out infinite; }
@keyframes ss-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

/* sections slide up as they scroll into view (only once JS has loaded) */
.ss-js .ss-reveal {
    opacity: 0; transform: translateY(24px);
    transition: opacity 0.7s cubic-bezier(.2,.7,.2,1), transform 0.7s cubic-bezier(.2,.7,.2,1);
}
.ss-js .ss-reveal.ss-in { opacity: 1; transform: none; }

/* lightbox pop-up */
.ss-lightbox {
    position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center;
    justify-content: center; padding: 5vh 6vw; background: rgba(28,19,13,0.88);
    -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
    opacity: 0; visibility: hidden; transition: opacity 0.25s ease, visibility 0.25s;
}
/* visible at once when opening so the close button can take focus */
.ss-lightbox.ss-open { opacity: 1; visibility: visible; transition: opacity 0.25s ease, visibility 0s; }
.ss-lightbox figure {
    margin: 0; max-width: 1100px; width: 100%; text-align: center;
    transform: scale(0.95) translateY(10px); transition: transform 0.35s cubic-bezier(.2,.7,.2,1);
}
.ss-lightbox.ss-open figure { transform: none; }
.ss-lightbox img {
    max-width: 100%; max-height: 78vh; border-radius: 16px; display: inline-block;
    box-shadow: 0 30px 80px -20px rgba(0,0,0,0.65);
}
.ss-lightbox figcaption { color: #E6C9A3; font-size: 0.85rem; margin-top: 14px; }
.ss-lb-close, .ss-lb-nav {
    position: absolute; width: 44px; height: 44px; border-radius: 999px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
    line-height: 1; color: #FFFDF9; background: rgba(255,253,249,0.12);
    border: 1px solid rgba(255,253,249,0.22); transition: background 0.15s ease;
}
.ss-lb-close:hover, .ss-lb-nav:hover { background: rgba(255,253,249,0.26); }
.ss-lb-close { top: 18px; right: 18px; }
.ss-lb-prev { left: 18px; top: 50%; transform: translateY(-50%); }
.ss-lb-next { right: 18px; top: 50%; transform: translateY(-50%); }
.ss-lb-single .ss-lb-nav { display: none; }

/* ── responsive ──────────────────────────────────────────────────────── */
@media (max-width: 900px) {
    .ss-hero-grid { grid-template-columns: 1fr !important; gap: 30px !important; }
    .ss-hero-art  { height: 320px !important; }
    .ss-about-grid { grid-template-columns: 1fr !important; gap: 26px !important; }
    .ss-dark-panel { padding: 32px 24px !important; }
}
@media (max-width: 640px) {
    .ss-wide { padding: 0 15px; }
    .ss-hero-art { display: none !important; }
    .ss-ba-grid { grid-template-columns: 1fr !important; }
    .ss-narrow  { max-width: 440px !important; margin: 0 auto !important; }
    .ss-medium  { max-width: 640px !important; margin: 0 auto !important; }
    .ss-auth-card { padding: 26px 22px 8px; }

    /* nav becomes a swipeable row instead of wrapping word by word */
    .ss-nav {
        width: 100%; gap: 18px !important; overflow-x: auto; padding-bottom: 6px;
        font-size: 0.82rem !important; scrollbar-width: none;
    }
    .ss-nav::-webkit-scrollbar { display: none; }
    .ss-hero-grid h1 { font-size: 2.35rem !important; }

    /* how-it-works cards become a swipe carousel */
    .ss-steps {
        display: flex !important; overflow-x: auto; scroll-snap-type: x mandatory;
        gap: 14px !important; padding-bottom: 10px; scrollbar-width: none;
    }
    .ss-steps::-webkit-scrollbar { display: none; }
    .ss-steps > * { flex: 0 0 84%; scroll-snap-align: start; }
    .ss-lb-nav { top: auto; bottom: 18px; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
    .ss-slides img, .ss-slide-dots span::after, .ss-float { animation: none !important; }
    .ss-slides img:first-child { opacity: 1 !important; }
    .ss-js .ss-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
    .ss-card, img[data-zoom] { transition: none !important; }
}
"""

# Fonts plus the small bit of JS behind the lightbox and scroll reveals. Gradio
# renders components after load, so everything uses event delegation and a
# MutationObserver rather than binding to elements directly.
HEAD_HTML = """
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>
/* SkinSense loader (window.ssLoader below). Styled here rather than in CSS:  */
/* Gradio only adds CSS once the app mounts, and this also covers first load. */
.ss-loader {
  position: fixed; inset: 0; z-index: 2147483000;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: radial-gradient(120% 90% at 50% 42%, #5A3E2B 0%, #3B2A20 55%, #2A1D15 100%);
  font-family: "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  opacity: 0; visibility: hidden;
  transition: opacity 0.22s ease, visibility 0s linear 0.22s;
}
.ss-loader.ss-loader-on { opacity: 1; visibility: visible; transition: opacity 0.22s ease; }
.ss-loader-mark {
  width: 104px; height: 104px; display: block;
  filter: drop-shadow(0 0 22px rgba(176, 122, 74, 0.35));
}
/* the scan ring turns; a caramel wave sweeps down the leaf, then the leaf */
/* flashes, like a sequential car indicator                                */
.ss-ld-ring { transform-box: fill-box; transform-origin: center;
              animation: ss-ld-spin 2.8s linear infinite; }
.ss-ld-wave { animation: ss-ld-sweep 1.6s cubic-bezier(0.45, 0, 0.25, 1) infinite; }
.ss-ld-leaf { fill: #6E4B33; animation: ss-ld-blink 1.6s ease-in-out infinite; }
.ss-loader-word { margin-top: 20px; font-size: 1.4rem; font-weight: 750;
                  letter-spacing: -0.025em; color: #F3E8DA; }
.ss-loader-word span { color: #E6C9A3; }
.ss-loader-msg { margin-top: 8px; min-height: 1.2em; font-size: 0.84rem;
                 letter-spacing: 0.04em; color: #CDB49A; }
@keyframes ss-ld-spin { to { transform: rotate(360deg); } }
@keyframes ss-ld-sweep { 0% { transform: translateY(-18px); }
                         70%, 100% { transform: translateY(40px); } }
@keyframes ss-ld-blink { 0%, 55% { fill: #6E4B33; } 72% { fill: #B07A4A; } 100% { fill: #6E4B33; } }
@media (prefers-reduced-motion: reduce) {
  .ss-ld-ring, .ss-ld-wave { animation: none; }
  .ss-ld-wave { transform: translateY(14px); }
  .ss-ld-leaf { animation-duration: 2.4s; }
}
</style>
<script>
/* Full-screen loader: covers first load until the app has drawn, and any wait
   wired with with_loader() in app.py. Waits under 250 ms never show it; once up
   it stays at least 450 ms so the wave reads instead of flickering. */
(function () {
  var LEAF = 'M24 9.5c6.4 4.6 10.6 10.2 10.6 15.6 0 6-4.7 10.4-10.6 10.4S13.4 31.1 13.4 25.1' +
             'c0-5.4 4.2-11 10.6-15.6z';
  var MARK = '<svg class="ss-loader-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">' +
    '<defs><clipPath id="ss-ld-clip"><path d="' + LEAF + '"/></clipPath>' +
    '<linearGradient id="ss-ld-grad" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#B07A4A" stop-opacity="0"/>' +
    '<stop offset="0.38" stop-color="#C9935F"/><stop offset="0.5" stop-color="#F3E8DA"/>' +
    '<stop offset="0.62" stop-color="#C9935F"/>' +
    '<stop offset="1" stop-color="#B07A4A" stop-opacity="0"/></linearGradient></defs>' +
    '<circle class="ss-ld-ring" cx="24" cy="24" r="21.2" stroke="#8A5A36" stroke-width="2.4" ' +
    'stroke-linecap="round" stroke-dasharray="88 22"/>' +
    '<path class="ss-ld-leaf" d="' + LEAF + '" fill="#6E4B33"/>' +
    '<g clip-path="url(#ss-ld-clip)"><rect class="ss-ld-wave" x="8" y="0" width="32" ' +
    'height="18" fill="url(#ss-ld-grad)"/></g>' +
    '<path d="M24 15.5v15.8M24 22.6l4.4-3.6M24 27.4l-4.4-3.6" stroke="#2A1D15" ' +
    'stroke-width="1.5" stroke-linecap="round" opacity="0.85"/></svg>';
  var el, msg, depth = 0, delay = null, fade = null, guard = null, since = 0;

  function build() {
    el = document.createElement('div');
    el.className = 'ss-loader';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML = MARK + '<div class="ss-loader-word">Skin<span>Sense</span></div>' +
      '<div class="ss-loader-msg"></div>';
    msg = el.lastChild;
    // on first load this runs from <head>, before <body> exists
    (document.body || document.documentElement).appendChild(el);
  }
  function up() {
    delay = null;
    since = Date.now();
    el.classList.add('ss-loader-on');
  }
  function down() {
    clearTimeout(delay);
    delay = null;
    clearTimeout(guard);
    fade = setTimeout(function () { el.classList.remove('ss-loader-on'); },
                      Math.max(0, 450 - (Date.now() - since)));
  }
  function show(text, now) {
    if (!el) { build(); }
    depth += 1;
    msg.textContent = text || 'Just a moment…';
    clearTimeout(fade);
    clearTimeout(guard);
    guard = setTimeout(function () { depth = 0; down(); }, 60000);   // never get stuck
    if (el.classList.contains('ss-loader-on') || delay) { return; }
    if (now) { up(); } else { delay = setTimeout(up, 250); }
  }
  function hide() {
    if (!el || !depth) { return; }
    depth -= 1;
    if (!depth) { down(); }
  }
  window.ssLoader = { show: show, hide: hide };

  // First load: cover Gradio's boot screen until the app has drawn something.
  var started = Date.now();
  show('Loading SkinSense…', true);
  (function ready() {
    if (document.querySelector('.gradio-container .html-container') ||
        Date.now() - started > 15000) { hide(); return; }
    setTimeout(ready, 100);
  })();
})();
</script>
<script>
(function () {
  document.documentElement.classList.add('ss-js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('ss-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;
  function inView(el) { return el.getBoundingClientRect().top < window.innerHeight - 40; }
  function scan() {
    document.querySelectorAll('.ss-reveal:not(.ss-seen)').forEach(function (el) {
      el.classList.add('ss-seen');
      if (!io || reduce || inView(el)) { el.classList.add('ss-in'); } else { io.observe(el); }
    });
  }
  // Some embeds throttle IntersectionObserver, so also check positions on scroll.
  var ticking = false;
  function onScroll() {
    if (ticking) { return; }
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      document.querySelectorAll('.ss-reveal.ss-seen:not(.ss-in)').forEach(function (el) {
        if (inView(el)) { el.classList.add('ss-in'); if (io) { io.unobserve(el); } }
      });
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', scan);

  var box, img, cap, list = [], idx = 0, opener = null;
  function build() {
    box = document.createElement('div');
    box.className = 'ss-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Image viewer');
    box.innerHTML = '<button type="button" class="ss-lb-close" aria-label="Close">&times;</button>' +
      '<button type="button" class="ss-lb-nav ss-lb-prev" aria-label="Previous image">&#8249;</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="ss-lb-nav ss-lb-next" aria-label="Next image">&#8250;</button>';
    document.body.appendChild(box);
    img = box.querySelector('img');
    cap = box.querySelector('figcaption');
    box.addEventListener('click', function (e) {
      var t = e.target;
      if (t === box || t.classList.contains('ss-lb-close')) { close(); }
      else if (t.classList.contains('ss-lb-prev')) { show(idx - 1); }
      else if (t.classList.contains('ss-lb-next')) { show(idx + 1); }
    });
  }
  function bigger(src) { return src.replace(/([?&])w=\\d+/, '$1w=1600'); }
  function show(i) {
    idx = (i + list.length) % list.length;
    var el = list[idx];
    img.src = bigger(el.currentSrc || el.src);
    img.alt = el.alt || '';
    cap.textContent = el.alt || '';
    box.classList.toggle('ss-lb-single', list.length < 2);
  }
  function open(el) {
    // inside the slideshow, open whichever slide is actually showing
    var slides = el.closest('.ss-slides');
    if (slides) {
      var best = el, bestOp = -1;
      slides.querySelectorAll('img').forEach(function (x) {
        var o = parseFloat(getComputedStyle(x).opacity);
        if (o > bestOp) { bestOp = o; best = x; }
      });
      el = best;
    }
    if (!box) { build(); }
    list = Array.prototype.filter.call(document.querySelectorAll('img[data-zoom]'),
      function (x) { return x.offsetParent !== null; });
    opener = document.activeElement;
    show(Math.max(0, list.indexOf(el)));
    box.classList.add('ss-open');
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(function () { box.querySelector('.ss-lb-close').focus(); });
  }
  function close() {
    box.classList.remove('ss-open');
    document.documentElement.style.overflow = '';
    if (opener && opener.focus) { opener.focus(); }
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('img[data-zoom]') : null;
    if (el) { e.preventDefault(); open(el); }
  });
  document.addEventListener('keydown', function (e) {
    if (!box || !box.classList.contains('ss-open')) {
      var a = document.activeElement;
      if ((e.key === 'Enter' || e.key === ' ') && a && a.matches && a.matches('img[data-zoom]')) {
        e.preventDefault(); open(a);
      }
      return;
    }
    if (e.key === 'Escape') { close(); }
    else if (e.key === 'ArrowLeft') { show(idx - 1); }
    else if (e.key === 'ArrowRight') { show(idx + 1); }
    else if (e.key === 'Tab') {
      // keep focus inside the dialog
      var f = box.querySelectorAll('button'), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
</script>
"""

# The default theme fetches Source Sans Pro from Google Fonts and Gradio waits for it
# before drawing anything, yet CSS swaps every font for Geist (loaded in HEAD_HTML,
# which doesn't block). Naming Geist here skips that fetch, so a slow font CDN can't
# hold up the first paint.
THEME = gr.themes.Default(font=["Geist", "-apple-system", "BlinkMacSystemFont",
                                "Segoe UI", "sans-serif"])

FORCE_LIGHT_JS = """
() => {
    function forceLight() {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
    }
    forceLight();
    setTimeout(forceLight, 300);
    setTimeout(forceLight, 1000);
    return [];
}
"""


HIDE_LOADER_JS = "() => { window.ssLoader && window.ssLoader.hide(); return []; }"


def with_loader(trigger, message, *steps):
    """Run `steps` (keyword arguments for an event listener) one after another behind
    the SkinSense loader (window.ssLoader in HEAD_HTML), showing `message`.

    In Gradio 6.13 a step that fails stops the rest of a .then() chain, so the loader
    is closed on each step's failure as well as after the last step succeeds."""
    trigger(fn=None, js="() => { window.ssLoader && window.ssLoader.show("
                        + json.dumps(message) + "); return []; }")
    event = trigger(**steps[0])
    for step in steps[1:]:
        event.failure(fn=None, js=HIDE_LOADER_JS)
        event = event.then(**step)
    event.failure(fn=None, js=HIDE_LOADER_JS)
    event.success(fn=None, js=HIDE_LOADER_JS)


# ══════════════════════════════════════════════════════════════════════════════
# LAYOUT
# ══════════════════════════════════════════════════════════════════════════════
def auth_header(step, total, title, lede, gid):
    return (
        '<div style="max-width:430px;margin:44px auto 16px;text-align:center;">'
        '<div style="display:flex;justify-content:center;margin-bottom:22px;">'
        + wordmark(44, gid, sub="Skin analysis") +
        '</div>'
        '<p style="font-size:0.66rem;letter-spacing:0.15em;color:' + EMERALD + ';'
        'text-transform:uppercase;margin:0 0 8px;font-weight:700;">Step ' + str(step)
        + ' of ' + str(total) + '</p>'
        '<h1 style="font-size:1.68rem;font-weight:750;color:' + INK + ';margin:0;'
        'letter-spacing:-0.028em;">' + title + '</h1>'
        '<p style="font-size:0.87rem;color:' + SUBTLE + ';margin:11px 0 0;line-height:1.65;">'
        + lede + '</p></div>'
    )


DASH_FOOTER = (
    '<div style="text-align:center;padding:40px 0 26px;margin-top:14px;'
    'border-top:1px solid ' + LINE + ';">'
    '<div style="display:flex;justify-content:center;margin-bottom:14px;">'
    + wordmark(30, "dashfoot") + '</div>'
    '<p style="font-size:0.72rem;color:' + FAINT + ';line-height:1.8;margin:0 auto;'
    'max-width:620px;">Educational screening only — SkinSense is not a medical device and '
    'does not diagnose, treat or cure any condition. Always consult a qualified dermatologist '
    'about a skin concern, and seek care promptly if your skin is painful, bleeding, spreading '
    'or changing rapidly.</p></div>'
)

PHOTO_TIPS = (
    '<div style="margin-top:15px;padding:19px 21px;background:' + WHITE + ';'
    'border:1px solid ' + LINE + ';border-radius:17px;">'
    '<p style="font-size:0.66rem;letter-spacing:0.1em;color:' + EMERALD + ';'
    'text-transform:uppercase;margin:0 0 12px;font-weight:750;">For the best reading</p>'
    '<div style="display:flex;flex-direction:column;gap:9px;">'
    '<span style="font-size:0.79rem;color:' + SUBTLE + ';display:flex;gap:9px;">'
    '<b style="color:' + EMERALD + ';">&check;</b> Even, natural light — avoid harsh shadows</span>'
    '<span style="font-size:0.79rem;color:' + SUBTLE + ';display:flex;gap:9px;">'
    '<b style="color:' + EMERALD + ';">&check;</b> Clean skin, little or no makeup</span>'
    '<span style="font-size:0.79rem;color:' + SUBTLE + ';display:flex;gap:9px;">'
    '<b style="color:' + EMERALD + ';">&check;</b> Face centred and in focus</span>'
    '<span style="font-size:0.79rem;color:' + SUBTLE + ';display:flex;gap:9px;">'
    '<b style="color:' + EMERALD + ';">&check;</b> Same spot each time for a fair comparison</span>'
    '</div></div>'
)


with gr.Blocks(title="SkinSense — AI Skin Analysis") as demo:

    pending_email = gr.State("")    # address a code was sent to (server-side only)
    profile_state = gr.State({})
    current_email = gr.State("")    # set only after a code is verified
    baseline_state = gr.State(None)

    # ══ SCREEN 0 — Landing ═══════════════════════════════════════════════════
    with gr.Column(visible=True) as landing_screen:
        gr.HTML(LANDING_HERO)
        with gr.Row(elem_classes=["ss-cta-row"]):
            get_started_btn = gr.Button("Get started — it's free",
                                        elem_classes=["ss-cta-btn"])
        gr.HTML(LANDING_BODY)
        with gr.Row(elem_classes=["ss-cta-row"]):
            get_started_btn2 = gr.Button("Analyse my skin now",
                                         elem_classes=["ss-cta-btn"])
        gr.HTML('<div style="height:46px;"></div>')

    # ══ SCREEN 1 — Sign in ═══════════════════════════════════════════════════
    with gr.Column(visible=False) as login_screen:
        gr.HTML(auth_header(1, 3, "Sign in to SkinSense",
                            "Enter your email and we'll send you a 6-digit code.", "login"))
        with gr.Row(equal_height=False):
            with gr.Column(scale=1, min_width=310):
                with gr.Column(elem_classes=["ss-auth-card"]):
                    email_input = gr.Textbox(label="Email address",
                                             placeholder="name@example.com", container=True)
                    login_status = gr.HTML("")
                    send_otp_btn = gr.Button("Send my code", elem_classes=["ss-primary-btn"])
                    gr.HTML(
                        '<p style="font-size:0.73rem;color:' + FAINT + ';text-align:center;'
                        'margin:12px 0 2px;line-height:1.6;">No password to remember. '
                        'We only use your email to send your code and reminders.</p>'
                    )
                back_home_btn = gr.Button("Back to home", elem_classes=["ss-link-btn"])
            with gr.Column(scale=1, min_width=310):
                gr.HTML(LOGIN_ASIDE)
        gr.HTML('<div style="height:46px;"></div>')

    # ══ SCREEN 2 — Verify ════════════════════════════════════════════════════
    with gr.Column(visible=False) as otp_screen:
        gr.HTML(auth_header(2, 3, "Check your inbox",
                            "Enter the 6-digit code we just sent you.", "otp"))
        with gr.Column(elem_classes=["ss-narrow"]):
            with gr.Column(elem_classes=["ss-auth-card"]):
                otp_status_display = gr.HTML("")
                otp_input = gr.Textbox(label="Verification code", placeholder="000000",
                                       container=True)
                verify_status = gr.HTML("")
                verify_otp_btn = gr.Button("Verify and continue",
                                           elem_classes=["ss-primary-btn"])
            with gr.Row():
                resend_btn = gr.Button("Resend code", elem_classes=["ss-link-btn"])
                back_btn = gr.Button("Use a different email", elem_classes=["ss-link-btn"])
        gr.HTML('<div style="height:46px;"></div>')

    # ══ SCREEN 3 — Profile ═══════════════════════════════════════════════════
    with gr.Column(visible=False) as profile_screen:
        gr.HTML(auth_header(3, 3, "Tell us about yourself",
                            "Every question is optional — skip anything you'd rather not answer. "
                            "It only sharpens your recommendations.", "prof"))
        with gr.Column(elem_classes=["ss-medium"]):
            with gr.Column(elem_classes=["ss-auth-card"]):
                with gr.Row():
                    name_input = gr.Textbox(label="Name", placeholder="Your name")
                    age_input = gr.Number(label="Age", precision=0)
                with gr.Row():
                    weight_input = gr.Number(label="Weight (kg)")
                    height_input = gr.Number(label="Height (cm)")

                gr.HTML(
                    '<div style="height:1px;background:' + LINE + ';margin:22px 0 16px;"></div>'
                    '<p style="font-size:0.68rem;letter-spacing:0.11em;color:' + EMERALD + ';'
                    'text-transform:uppercase;margin:0 0 4px;font-weight:750;">Diet habits</p>'
                    '<p style="font-size:0.78rem;color:' + FAINT + ';margin:0 0 16px;'
                    'line-height:1.6;">Diet is not the cause of every skin condition, but it '
                    'matters for acne, oily skin and pigmentation.</p>'
                )
                oily_food_input = gr.Radio(["Never", "Rarely", "Often", "Daily"],
                                           label="Do you eat oily or fried food?")
                fastfood_input = gr.Radio(["Never", "Rarely", "Often", "Daily"],
                                          label="Do you eat fast food?")
                foodtype_input = gr.Dropdown(["Vegetarian", "Non-vegetarian", "Vegan", "Mixed"],
                                             label="What type of food do you mostly eat?")
                sweets_input = gr.Radio(["Never", "Rarely", "Often", "Daily"],
                                        label="Do you eat sweets or sugary snacks?")
                sweet_qty_input = gr.Radio(["Not much", "A moderate amount", "Quite a lot"],
                                           label="If yes, how much would you usually eat?")
                gr.HTML('<div style="height:10px;"></div>')
                continue_btn = gr.Button("Continue to my dashboard",
                                         elem_classes=["ss-primary-btn"])
            skip_profile_btn = gr.Button("Skip for now", elem_classes=["ss-link-btn"])
        gr.HTML('<div style="height:46px;"></div>')

    # ══ SCREEN 4 — Dashboard ═════════════════════════════════════════════════
    with gr.Column(visible=False) as main_screen:
        with gr.Row():
            with gr.Column(scale=4):
                gr.HTML('<div style="padding:26px 0 0;">' + wordmark(44, "dash",
                        sub="Your dashboard") + '</div>')
                greeting_output = gr.HTML("")
            with gr.Column(scale=1, min_width=130):
                gr.HTML('<div style="height:34px;"></div>')
                logout_btn = gr.Button("Sign out", elem_classes=["ss-link-btn"])

        gr.HTML(divider(24))

        # 1 — Scan
        gr.HTML(section_header(1, "Scan your skin",
                               "Upload a photo, or use your camera, then run the analysis."))
        with gr.Row(equal_height=False):
            with gr.Column(scale=1, min_width=300):
                image_input = gr.Image(type="pil", label="Your photo", height=280,
                                       elem_classes=["ss-upload"])
                analyse_btn = gr.Button("Analyse my skin", elem_id="ss-analyse-btn")
                routine_done_btn = gr.Button("Mark today's routine done",
                                             elem_classes=["ss-ghost-btn"])
                gr.HTML(PHOTO_TIPS)
            with gr.Column(scale=1, min_width=300):
                result_output = gr.HTML(EMPTY_RESULT)

        lifestyle_output = gr.HTML("")

        # 2 — Before & after
        gr.HTML(divider())
        gr.HTML(section_header(2, "Before & after",
                               "Your first scan is kept as a baseline and compared with your latest."))
        progress_output = gr.HTML(build_progress_html(None, None))
        with gr.Row():
            with gr.Column(scale=1, min_width=200):
                reset_baseline_btn = gr.Button("Reset my baseline",
                                               elem_classes=["ss-link-btn"])
            with gr.Column(scale=3):
                gr.HTML("")

        # 3 — History
        gr.HTML(divider())
        gr.HTML(section_header(3, "Check-in history",
                               "How the confidence score has moved across your visits."))
        history_output = gr.HTML(
            EMPTY_PANEL_TEMPLATE.format(
                title="Check-in history",
                body="Your check-in history will appear here once you analyse your skin."
            )
        )

        # 4 — Breakdown
        gr.HTML(divider())
        gr.HTML(section_header(4, "Condition breakdown",
                               "Every category the model scored, not just the headline."))
        scores_output = gr.HTML(
            EMPTY_PANEL_TEMPLATE.format(title="Condition breakdown",
                                        body="Scores will appear after your analysis.")
        )

        # 5 — Routine
        gr.HTML(divider())
        gr.HTML(section_header(5, "Your routine",
                               "Built around the active ingredients that matter for your result."))
        with gr.Row(equal_height=False):
            with gr.Column():
                morning_output = gr.HTML(
                    EMPTY_PANEL_TEMPLATE.format(title="Morning routine",
                                                body="Complete an analysis to see your routine.")
                )
            with gr.Column():
                night_output = gr.HTML(
                    EMPTY_PANEL_TEMPLATE.format(title="Evening routine",
                                                body="Complete an analysis to see your routine.")
                )

        # 6 — Habits
        gr.HTML(divider())
        gr.HTML(section_header(6, "Daily habits",
                               "Small, repeatable changes that support the routine."))
        tips_output = gr.HTML(
            EMPTY_PANEL_TEMPLATE.format(title="Daily habits",
                                        body="Personalised tips will appear here.")
        )

        gr.HTML(DASH_FOOTER)

    # ══ SCREEN 5 — Admin ═════════════════════════════════════════════════════
    with gr.Column(visible=False) as admin_screen:
        with gr.Row():
            with gr.Column(scale=4):
                gr.HTML('<div style="padding:26px 0 0;">' + wordmark(44, "adm",
                        sub="Admin console") + '</div>')
            with gr.Column(scale=1, min_width=130):
                gr.HTML('<div style="height:34px;"></div>')
                admin_logout_btn = gr.Button("Sign out", elem_classes=["ss-link-btn"])

        gr.HTML(divider(24))
        gr.HTML(section_header(1, "All users", "Streaks, activity and doctor-referral flags."))
        admin_table_output = gr.HTML("")
        with gr.Row():
            with gr.Column(scale=1, min_width=160):
                refresh_admin_btn = gr.Button("Refresh table", elem_classes=["ss-ghost-btn"])
            with gr.Column(scale=3):
                gr.HTML("")

        gr.HTML(divider())
        gr.HTML(section_header(2, "Send a reminder",
                               "Nudge one user, or everyone inactive for 3+ days."))
        with gr.Row():
            admin_user_select = gr.Dropdown(choices=[], label="Select user")
            admin_reminder_msg = gr.Textbox(
                label="Message",
                placeholder="We miss you! Come back and keep your streak alive."
            )
        with gr.Row():
            send_reminder_btn = gr.Button("Send to selected user",
                                          elem_classes=["ss-primary-btn"])
            send_bulk_btn = gr.Button("Remind all inactive 3+ days",
                                      elem_classes=["ss-ghost-btn"])
        admin_status = gr.HTML("")

        gr.HTML(divider())
        gr.HTML(section_header(3, "Remove a user",
                               "Deletes the record of the user chosen in “Select user” "
                               "above. For test accounts and deletion requests."))
        with gr.Row():
            with gr.Column(scale=2):
                admin_remove_confirm = gr.Checkbox(
                    label="Yes, remove the selected user", value=False)
            with gr.Column(scale=1, min_width=160):
                remove_user_btn = gr.Button("Remove selected user",
                                            elem_classes=["ss-ghost-btn"])
        admin_remove_status = gr.HTML("")
        gr.HTML(DASH_FOOTER)

    # ══ WIRING ═══════════════════════════════════════════════════════════════
    demo.load(fn=None, inputs=[], outputs=[], js=FORCE_LIGHT_JS)

    get_started_btn.click(fn=go_to_login, inputs=[],
                          outputs=[landing_screen, login_screen])
    get_started_btn2.click(fn=go_to_login, inputs=[],
                           outputs=[landing_screen, login_screen])
    back_home_btn.click(fn=go_to_landing, inputs=[],
                        outputs=[landing_screen, login_screen])

    # Each screen switch is followed by a .then() step that fills the new screen
    # (see otp_sent_note / populate_after_signin for why).
    send_otp_outputs = [pending_email, login_screen, otp_screen, login_status]
    for trigger in (send_otp_btn.click, email_input.submit):
        with_loader(trigger, "Sending your code…",
                    dict(fn=send_otp_wrapper, inputs=[email_input], outputs=send_otp_outputs),
                    dict(fn=otp_sent_note, inputs=[pending_email],
                         outputs=[otp_status_display]))

    verify_outputs = [otp_screen, profile_screen, main_screen, admin_screen, verify_status,
                      current_email, profile_state, otp_input, otp_status_display]
    signed_in_outputs = [greeting_output, history_output, admin_table_output,
                         admin_user_select]
    for trigger in (verify_otp_btn.click, otp_input.submit):
        with_loader(trigger, "Checking your code…",
                    dict(fn=verify_otp_wrapper, inputs=[otp_input, pending_email],
                         outputs=verify_outputs),
                    dict(fn=populate_after_signin, inputs=[current_email, profile_state],
                         outputs=signed_in_outputs))

    with_loader(resend_btn.click, "Sending a new code…",
                dict(fn=resend_otp_wrapper, inputs=[pending_email],
                     outputs=[otp_status_display]))

    back_btn.click(fn=back_to_login, inputs=[],
                   outputs=[login_screen, otp_screen, otp_status_display])

    with_loader(continue_btn.click, "Saving your profile…",
                dict(fn=save_profile_fn,
                     inputs=[current_email, name_input, age_input, weight_input, height_input,
                             oily_food_input, fastfood_input, foodtype_input,
                             sweets_input, sweet_qty_input],
                     outputs=[profile_state, profile_screen, main_screen]),
                dict(fn=populate_dashboard, inputs=[current_email, profile_state],
                     outputs=[greeting_output, history_output]))

    with_loader(skip_profile_btn.click, "Opening your dashboard…",
                dict(fn=skip_profile_fn, inputs=[current_email],
                     outputs=[profile_state, profile_screen, main_screen]),
                dict(fn=populate_dashboard, inputs=[current_email, profile_state],
                     outputs=[greeting_output, history_output]))

    session_reset = [profile_state, current_email, baseline_state, pending_email]
    logout_btn.click(fn=logout_fn, inputs=[],
                     outputs=[landing_screen, main_screen] + session_reset)
    admin_logout_btn.click(fn=logout_fn, inputs=[],
                           outputs=[landing_screen, admin_screen] + session_reset)

    with_loader(analyse_btn.click, "Analysing your skin…",
                dict(fn=analyse_skin,
                     inputs=[image_input, profile_state, current_email, baseline_state],
                     outputs=[result_output, scores_output, morning_output, night_output,
                              tips_output, lifestyle_output, greeting_output, history_output,
                              baseline_state, progress_output]))

    reset_baseline_btn.click(fn=reset_baseline_fn, inputs=[],
                             outputs=[baseline_state, progress_output])

    with_loader(routine_done_btn.click, "Saving your routine…",
                dict(fn=mark_routine_done_fn, inputs=[current_email],
                     outputs=[greeting_output]))

    with_loader(refresh_admin_btn.click, "Refreshing users…",
                dict(fn=refresh_admin_fn, inputs=[current_email],
                     outputs=[admin_table_output, admin_user_select]))

    with_loader(send_reminder_btn.click, "Sending the reminder…",
                dict(fn=send_reminder_fn,
                     inputs=[current_email, admin_user_select, admin_reminder_msg],
                     outputs=[admin_status, admin_table_output]))

    with_loader(send_bulk_btn.click, "Sending reminders…",
                dict(fn=send_bulk_reminder_fn, inputs=[current_email, admin_reminder_msg],
                     outputs=[admin_status, admin_table_output]))

    with_loader(remove_user_btn.click, "Removing the user…",
                dict(fn=remove_user_fn,
                     inputs=[current_email, admin_user_select, admin_remove_confirm],
                     outputs=[admin_remove_status, admin_table_output,
                              admin_user_select, admin_remove_confirm]))

# None of these handlers are meant to be called as an API: keep every event UI-only.
# Gradio's own progress tracker (a spinner over each output) is off everywhere too;
# the SkinSense loader covers the waits instead.
for _fn in demo.fns.values():
    _fn.api_visibility = "private"
    _fn.show_progress = "hidden"


class GzipAppPage:
    """Gzip the app's own page. It inlines the whole UI (about 190 KB of HTML) and
    Hugging Face's proxy sends it uncompressed; gzipped it is about 23 KB. Only "/"
    is touched, so Gradio's streaming updates and photo uploads pass straight through."""

    def __init__(self, app):
        self.app = app
        self.gzip = GZipMiddleware(app, minimum_size=1024)

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http" and scope["path"] == "/":
            await self.gzip(scope, receive, send)
        else:
            await self.app(scope, receive, send)


APP_KWARGS = {"middleware": [Middleware(GzipAppPage)]}


def serve_site(app):
    """Serve the static marketing site at /site. The mount goes at the front of
    the route list so Gradio's own catch-all doesn't swallow /site first. Gzip cuts
    the site's HTML and scripts to about a quarter of their size on the wire."""
    if not os.path.isdir(SITE_DIR):
        return False
    from fastapi.staticfiles import StaticFiles
    from starlette.routing import Mount
    site = GZipMiddleware(StaticFiles(directory=SITE_DIR, html=True), minimum_size=1024)
    app.router.routes.insert(0, Mount("/site", app=site, name="site"))
    return True


if __name__ == "__main__":
    # ssr_mode=False: Gradio's server-side rendering puts a Node server in front
    # that swallows /site, and it paints the buttons before the gr.HTML content,
    # so a slow load showed a page of bare buttons. Client rendering avoids both.
    # prevent_thread_lock so the site can be attached to the running server,
    # then block_thread keeps the Space alive as usual.
    demo.launch(css=CSS, head=HEAD_HTML, theme=THEME, footer_links=[], ssr_mode=False,
                app_kwargs=APP_KWARGS, prevent_thread_lock=True)
    try:
        print("Marketing site at /site" if serve_site(demo.app) else "No site/ folder; /site off")
    except Exception as e:
        print("Could not serve /site: " + str(e))
    demo.block_thread()
