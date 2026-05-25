"""
AI extraction service — uses Claude claude-sonnet-4-6 to extract structured
insurance submission data from raw document text.

Output is validated against ExtractedData pydantic model.
Falls back to a partial result on parse error rather than failing entirely.
"""
import json
import re
from app.models.submission import ExtractedData
from app.core.config import settings
import anthropic

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

EXTRACTION_PROMPT = """\
You are a senior Lloyd's of London insurance underwriter with 20+ years experience \
across marine, property, cyber, D&O, crime, and professional indemnity lines.

Analyse the following insurance submission document and extract structured data.

Return a single JSON object with EXACTLY these fields (use null if information is not present):

{
  "insured_name":     string | null,          // Legal entity name of the insured
  "coverage_type":    string | null,          // One of: Marine Cargo, Cyber Liability, D&O Liability, Property, Crime, Professional Indemnity, Liability, Terrorism, Aviation, Energy
  "coverage_limit":   string | null,          // e.g. "£5,000,000" — include currency symbol
  "premium_estimate": string | null,          // If stated — e.g. "£42,000"
  "industry":         string | null,          // Industry/sector of the insured
  "effective_date":   string | null,          // Policy inception date if stated
  "jurisdiction":     string | null,          // Primary jurisdiction/domicile
  "employees":        string | null,          // Number of employees if stated
  "revenue":          string | null,          // Annual revenue/turnover if stated
  "loss_history":     string | null,          // Narrative summary of claims history — be specific about amounts, dates, cause
  "risk_factors":     string[],               // Array of specific risk factors. Each entry should be a concise, actionable phrase (max 10 words). List 2-6 factors.
  "confidence_score": number                  // 0.0–1.0. How complete is the extraction? 1.0 = all fields found with high certainty.
}

Accuracy is critical. This data will be used for underwriting decisions and regulatory reporting.
Do NOT invent data not present in the document. If a field cannot be determined, use null.
Risk factors should be specific (e.g. "3 claims in 36 months — above market average") not generic (e.g. "high risk").

Document:
---
{document_text}
---

Return ONLY valid JSON. No markdown, no explanation, no preamble."""


async def extract_submission_data(document_text: str) -> ExtractedData:
    """
    Extract structured insurance data from raw document text using Claude.
    Returns a validated ExtractedData object.
    Raises on API failure; returns partial result on JSON parse failure.
    """
    # Truncate very long documents to stay within context
    text_input = document_text[:12_000] if len(document_text) > 12_000 else document_text

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        temperature=0,          # deterministic extraction
        messages=[
            {
                "role": "user",
                "content": EXTRACTION_PROMPT.format(document_text=text_input),
            }
        ],
    )

    raw = message.content[0].text.strip()

    # Strip markdown code fences if present
    raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
    raw = re.sub(r"\s*```$", "", raw)
    raw = raw.strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        # Attempt to extract JSON substring
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group())
            except Exception:
                # Return minimal valid object — referral triggered by low confidence
                return ExtractedData(confidence_score=0.1)
        else:
            return ExtractedData(confidence_score=0.1)

    # Ensure risk_factors is a list of strings
    if not isinstance(data.get("risk_factors"), list):
        data["risk_factors"] = []

    return ExtractedData(**{k: v for k, v in data.items() if k in ExtractedData.model_fields})
