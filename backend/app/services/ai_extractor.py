import anthropic
from app.models.submission import ExtractedData
from app.core.config import settings
import json

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

EXTRACTION_PROMPT = """You are an expert insurance underwriter assistant.
Extract structured data from the following insurance submission document.

Return a JSON object with exactly these fields:
- insured_name: string or null
- coverage_type: string or null
- coverage_limit: string or null
- premium_estimate: string or null
- industry: string or null
- risk_factors: array of strings (key risks identified)
- loss_history: string summary or null
- effective_date: string or null
- confidence_score: float between 0 and 1 (how complete the extraction is)

Document text:
{document_text}

Return only valid JSON, no explanation."""


async def extract_submission_data(document_text: str) -> ExtractedData:
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": EXTRACTION_PROMPT.format(document_text=document_text),
            }
        ],
    )

    raw = message.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    data = json.loads(raw)
    return ExtractedData(**data)
