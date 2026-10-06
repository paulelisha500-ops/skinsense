import json
from typing import List, Dict
import config

def load_products() -> List[Dict]:
    with open(config.PRODUCTS_PATH) as f:
        return json.load(f)

def get_products_for_condition(condition: str, max_per_type: int = 2) -> Dict[str, List]:
    all_products = load_products()
    grouped: Dict[str, List] = {}
    for product in all_products:
        if condition in product["targets"]:
            ptype = product["type"]
            if ptype not in grouped:
                grouped[ptype] = []
            if len(grouped[ptype]) < max_per_type:
                grouped[ptype].append(product)
    return grouped