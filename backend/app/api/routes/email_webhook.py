from fastapi import APIRouter, Request, HTTPException
from app.services.document_parser import extract_text
from app.services.ai_extractor import extract_submission_data
from app.services.scoring import compute_risk_score, apply_appetite
import uuid
from datetime import datetime

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/email")
async def receive_email(request: Request):
    """
    Receives forwarded emails from Postmark/Mailgun/SendGrid.
    Configure your email provider to POST inbound emails here.
    Expected payload: { from, subject, text, html, attachments: [{name, content_type, content}] }
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    sender = payload.get("from", "unknown@broker.com")
    sender_name = sender.split("<")[0].strip() if "<" in sender else sender.split("@")[0]
    subject = payload.get("subject", "Submission")

    text_body = payload.get("text", "") or payload.get("html", "")
    attachments = payload.get("attachments", [])

    full_text = f"Subject: {subject}\nFrom: {sender}\n\n{text_body}"

    for att in attachments:
        content = att.get("content", "")
        name = att.get("name", "attachment.txt")
        if isinstance(content, str):
            content_bytes = content.encode("utf-8")
        else:
            import base64
            content_bytes = base64.b64decode(content)
        full_text += f"\n\n--- Attachment: {name} ---\n{extract_text(content_bytes, name)}"

    if not full_text.strip():
        return {"status": "ignored", "reason": "No extractable content"}

    extracted = await extract_submission_data(full_text)
    score = compute_risk_score(extracted)
    decision = apply_appetite(score, extracted)

    sub_id = f"VLX-{uuid.uuid4().hex[:4].upper()}"

    return {
        "id": sub_id,
        "status": decision,
        "score": score,
        "insured_name": extracted.insured_name,
        "coverage_type": extracted.coverage_type,
        "broker_email": sender,
        "processed_at": datetime.utcnow().isoformat(),
    }
