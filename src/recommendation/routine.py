from typing import Dict, List
from src.recommendation.products import get_products_for_condition

MORNING_STEPS = ["cleanser", "exfoliant", "serum", "moisturizer", "sunscreen"]
NIGHT_STEPS   = ["cleanser", "treatment", "serum", "moisturizer"]


def build_routine(condition: str, severity: str) -> Dict:
    products = get_products_for_condition(condition)
    morning  = _build_sequence(MORNING_STEPS, products, "morning")
    night    = _build_sequence(NIGHT_STEPS,   products, "night")
    return {
        "morning":       morning,
        "night":         night,
        "general_tips":  _get_tips(condition),
        "severity_note": _get_severity_note(severity, condition),
    }


def _build_sequence(steps: List[str], products: Dict, time_of_day: str) -> List[Dict]:
    routine  = []
    step_num = 1
    for step_type in steps:
        if time_of_day == "night" and step_type == "exfoliant":
            continue
        if time_of_day == "morning" and step_type == "treatment":
            continue
        if step_type in products and products[step_type]:
            product = products[step_type][0]
            routine.append({
                "step":    step_num,
                "type":    step_type,
                "product": product,
                "tip":     _get_step_tip(step_type),
            })
            step_num += 1
    return routine


def _get_step_tip(step_type: str) -> str:
    tips = {
        "cleanser":    "Massage gently for 60 seconds, then rinse with lukewarm water.",
        "exfoliant":   "Apply to dry skin, wait 20 minutes before next step. Use 3x/week max.",
        "serum":       "Apply 2-3 drops to damp skin and press in — do not rub.",
        "moisturizer": "Apply while skin is still slightly damp to lock in hydration.",
        "sunscreen":   "Apply last, every morning. Reapply every 2 hours in direct sun.",
        "treatment":   "Pea-sized amount only. Apply at night — can cause sun sensitivity.",
    }
    return tips.get(step_type, "Apply as directed on packaging.")


def _get_tips(condition: str) -> List[str]:
    general = [
        "Change your pillowcase at least twice a week.",
        "Never sleep with makeup on.",
        "Drink at least 8 glasses of water daily.",
        "Avoid touching your face throughout the day.",
    ]
    condition_tips = {
        "acne":              ["Avoid heavy, oil-based products.",
                              "Keep hair away from your face.",
                              "Clean your phone screen regularly."],
        "dry_skin":          ["Use a humidifier in dry environments.",
                              "Avoid hot showers — use lukewarm water.",
                              "Apply moisturizer within 3 minutes of washing."],
        "oily_skin":         ["Blotting papers help control midday shine.",
                              "Do not skip moisturizer — dehydrated skin produces more oil.",
                              "Use non-comedogenic (oil-free) products."],
        "rosacea":           ["Avoid triggers: spicy food, alcohol, extreme temperatures.",
                              "Use only fragrance-free, gentle products.",
                              "Always apply SPF — UV worsens rosacea."],
        "eczema":            ["Moisturize immediately after bathing.",
                              "Wear loose, breathable cotton clothing.",
                              "Avoid fragranced detergents and fabric softeners."],
        "hyperpigmentation": ["SPF is non-negotiable — UV darkens existing spots.",
                              "Be patient — fading takes 8-12 weeks minimum.",
                              "Vitamin C serums can boost brightening in the morning."],
        "normal_skin":       ["Maintain your routine consistently.",
                              "Introduce new products one at a time.",
                              "SPF every day, even indoors."],
    }
    return general + condition_tips.get(condition, [])


def _get_severity_note(severity: str, condition: str) -> str:
    if condition == "normal_skin":
        return ("Your skin reads as balanced, with no active concern detected. The routine "
                "below is about maintenance: gentle cleansing, hydration and daily SPF.")
    notes = {
        "mild":     "Your condition appears mild. Consistent use of the recommended "
                    "routine should show visible improvement within 4-8 weeks.",
        "moderate": "Your condition is moderate. Follow this routine consistently and "
                    "monitor your skin over the next 6-8 weeks. If no improvement, "
                    "consult a dermatologist.",
        "severe":   "Your condition appears severe. We strongly recommend consulting "
                    "a board-certified dermatologist. The routine below can help while "
                    "you arrange an appointment, but prescription treatment may be needed.",
    }
    return notes.get(severity, "")