from app.models.submission import ExtractedData

DEFAULT_RULES = [
    {"coverage_type": "All",           "field": "score",        "operator": "gt",       "value": "75", "action": "accept",  "priority": 1},
    {"coverage_type": "All",           "field": "score",        "operator": "lt",       "value": "35", "action": "decline", "priority": 2},
    {"coverage_type": "Cyber Liability","field": "loss_history", "operator": "contains", "value": "claim", "action": "refer","priority": 3},
    {"coverage_type": "All",           "field": "score",        "operator": "gt",       "value": "50", "action": "refer",   "priority": 4},
    {"coverage_type": "All",           "field": "score",        "operator": "lt",       "value": "50", "action": "decline", "priority": 5},
]


def compute_risk_score(extracted: ExtractedData) -> int:
    score = 70

    # Risk factor penalty
    score -= len(extracted.risk_factors) * 5

    # Loss history signals
    lh = (extracted.loss_history or "").lower()
    if "no claims" in lh or "clean" in lh:
        score += 15
    elif "claim" in lh:
        score -= 10
    if "major" in lh or "salvage" in lh:
        score -= 10
    if "fraud" in lh:
        score -= 15

    # Confidence bonus/penalty
    if extracted.confidence_score < 0.7:
        score -= 10

    return max(0, min(100, score))


def apply_appetite(score: int, extracted: ExtractedData, rules: list = None) -> str:
    active_rules = sorted(rules or DEFAULT_RULES, key=lambda r: r["priority"])
    lh = (extracted.loss_history or "").lower()
    ct = extracted.coverage_type or ""

    for rule in active_rules:
        if rule["coverage_type"] not in ("All", ct):
            continue
        field = rule["field"]
        op = rule["operator"]
        val = rule["value"]

        if field == "score":
            v = int(val)
            if op == "gt" and score > v:
                return rule["action"]
            if op == "lt" and score < v:
                return rule["action"]
            if op == "eq" and score == v:
                return rule["action"]
        elif field == "loss_history":
            if op == "contains" and val.lower() in lh:
                return rule["action"]
            if op == "not_contains" and val.lower() not in lh:
                return rule["action"]

    return "refer"
