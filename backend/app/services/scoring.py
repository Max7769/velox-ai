"""
Scoring service — algorithmic risk score + Claude-powered score factor analysis.
"""
import json
import re
import anthropic
from app.models.submission import ExtractedData, ScoreFactor, PremiumModel
from app.core.config import settings

_client: anthropic.Anthropic | None = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    return _client


DEFAULT_RULES = [
    {"coverage_type": "All",            "field": "score",        "operator": "gt",       "value": "75", "action": "accept",  "priority": 1},
    {"coverage_type": "All",            "field": "score",        "operator": "lt",       "value": "35", "action": "decline", "priority": 2},
    {"coverage_type": "Cyber Liability","field": "loss_history", "operator": "contains", "value": "claim", "action": "refer","priority": 3},
    {"coverage_type": "All",            "field": "score",        "operator": "gt",       "value": "50", "action": "refer",   "priority": 4},
    {"coverage_type": "All",            "field": "score",        "operator": "lt",       "value": "50", "action": "decline", "priority": 5},
]


def compute_risk_score(extracted: ExtractedData) -> int:
    score = 70

    score -= len(extracted.risk_factors) * 5

    lh = (extracted.loss_history or "").lower()
    if "no claims" in lh or "clean" in lh or "no claim" in lh:
        score += 15
    elif "claim" in lh:
        score -= 10
    if "major" in lh or "salvage" in lh:
        score -= 10
    if "fraud" in lh:
        score -= 15
    if "frequency" in lh or "multiple" in lh:
        score -= 8

    if extracted.confidence_score < 0.7:
        score -= 10

    return max(0, min(100, score))


def apply_appetite(score: int, extracted: ExtractedData, rules: list | None = None) -> str:
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


SCORE_FACTORS_PROMPT = """\
You are a Lloyd's of London senior underwriter. You have just reviewed an insurance submission and \
assigned an overall risk score of {score}/100. Now explain that score using 4–7 specific score factors.

Submission data:
Coverage type:  {coverage_type}
Industry:       {industry}
Loss history:   {loss_history}
Risk factors:   {risk_factors}
Revenue:        {revenue}
Employees:      {employees}
Jurisdiction:   {jurisdiction}
Coverage limit: {coverage_limit}

Return a JSON object with two fields:
1. "score_factors": array of objects, each with:
   - "label": short label (2–4 words)
   - "impact": integer from -30 to +30 (positive = improves score, negative = reduces it)
   - "detail": one sentence explaining this factor's impact (max 20 words)

2. "premium_model": object with:
   - "base": integer — the central annual premium in GBP
   - "low": integer — minimum reasonable premium (base × 0.85)
   - "mid": integer — recommended premium (base × 1.05)
   - "high": integer — maximum if referred (base × 1.30)
   - "currency": "GBP"
   - "basis": string — one line describing how premium is calculated

The score factors should add up approximately to justify the overall score of {score}/100 \
(baseline is 70, so factors should net to {net:+d}).
Return ONLY valid JSON. No markdown, no explanation."""


async def generate_score_analysis(extracted: ExtractedData, score: int) -> tuple[list[ScoreFactor], PremiumModel | None]:
    """
    Calls Claude to generate detailed score factors and a premium model.
    Falls back gracefully if the API call fails.
    """
    try:
        client = _get_client()
        net = score - 70
        prompt = SCORE_FACTORS_PROMPT.format(
            score=score,
            net=net,
            coverage_type=extracted.coverage_type or "Unknown",
            industry=extracted.industry or "Unknown",
            loss_history=extracted.loss_history or "Not stated",
            risk_factors=", ".join(extracted.risk_factors) if extracted.risk_factors else "None identified",
            revenue=extracted.revenue or "Not stated",
            employees=extracted.employees or "Not stated",
            jurisdiction=extracted.jurisdiction or "Not stated",
            coverage_limit=extracted.coverage_limit or "Not stated",
        )

        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            temperature=0,
            messages=[{"role": "user", "content": prompt}],
        )

        raw = message.content[0].text.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
        raw = re.sub(r"\s*```$", "", raw)

        data = json.loads(raw)

        factors = [ScoreFactor(**f) for f in (data.get("score_factors") or [])]
        pm_data = data.get("premium_model")
        premium = PremiumModel(**pm_data) if pm_data else None

        return factors, premium

    except Exception:
        # Non-fatal — submission still works without detailed factors
        return [], None
