from fastapi import APIRouter, UploadFile, File, HTTPException, Body, Query
from app.services.document_parser import extract_text
from app.services.ai_extractor import extract_submission_data
from app.services.scoring import compute_risk_score, apply_appetite, generate_score_analysis
from app.services import database as db
from app.models.submission import ExtractedData
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

router = APIRouter(prefix="/submissions", tags=["submissions"])


class SubmissionResponse(BaseModel):
    id: str
    status: str
    score: Optional[int] = None
    extracted_data: Optional[dict] = None
    broker_name: str = ""
    broker_email: str = ""
    broker_company: str = ""
    file_name: Optional[str] = None
    notes: Optional[str] = None
    decision_by: Optional[str] = None
    decision_at: Optional[str] = None
    processed_at: Optional[str] = None
    created_at: str


class DecideRequest(BaseModel):
    decision: str
    actor: str = "underwriter"
    notes: Optional[str] = None


@router.post("/ingest", response_model=SubmissionResponse)
async def ingest_submission(
    file: UploadFile = File(...),
    broker_name: str = Body(...),
    broker_email: str = Body(...),
    broker_company: str = Body(...),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    contents = await file.read()
    text = extract_text(contents, file.filename)

    if not text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from document")

    # 1. Create submission record (status = processing)
    record = await db.create_submission(
        broker_name=broker_name,
        broker_email=broker_email,
        broker_company=broker_company,
        file_name=file.filename,
        status="processing",
    )
    sub_id = record["id"]

    # 2. Audit: received
    await db.add_audit_entry(sub_id, "submitted", broker_name, f"Document '{file.filename}' uploaded via API")

    # 3. AI extraction + scoring + factor analysis
    try:
        extracted = await extract_submission_data(text)
        score = compute_risk_score(extracted)
        rules = await db.get_rules()
        decision = apply_appetite(score, extracted, rules if rules else None)

        # Generate detailed score factors and premium model (non-blocking if fails)
        score_factors, premium_model = await generate_score_analysis(extracted, score)
        if score_factors:
            extracted.score_factors = score_factors
        if premium_model:
            extracted.premium_model = premium_model
    except Exception as e:
        await db.update_submission(sub_id, {"status": "referred", "notes": f"Extraction error: {e}"})
        raise HTTPException(status_code=500, detail=f"AI extraction failed: {e}")

    # 4. Persist results
    now_iso = datetime.now(timezone.utc).isoformat()
    updates = {
        "status": decision,
        "score": score,
        "extracted_data": extracted.model_dump(),
        "processed_at": now_iso,
    }
    updated = await db.update_submission(sub_id, updates)

    # 5. Audit: extracted + auto-decision
    await db.add_audit_entry(
        sub_id, "extracted", "Velox AI",
        f"Data extracted with {round(extracted.confidence_score * 100)}% confidence. Risk score: {score}/100",
    )
    await db.add_audit_entry(
        sub_id, decision, "Velox AI",
        f"Automatic decision: {decision} (score {score})",
    )

    return SubmissionResponse(
        id=sub_id,
        status=decision,
        score=score,
        extracted_data=extracted.model_dump(),
        broker_name=broker_name,
        broker_email=broker_email,
        broker_company=broker_company,
        file_name=file.filename,
        created_at=record["created_at"],
        processed_at=now_iso,
    )


@router.get("/", response_model=list[SubmissionResponse])
async def list_submissions_route(limit: int = Query(default=100, le=500)):
    records = await db.list_submissions(limit=limit)
    return [SubmissionResponse(**r) for r in records]


@router.get("/status")
async def db_status():
    return db.db_status()


@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission(submission_id: str):
    record = await db.get_submission(submission_id)
    if not record:
        raise HTTPException(status_code=404, detail="Submission not found")
    return SubmissionResponse(**record)


@router.patch("/{submission_id}/decide")
async def decide_submission(submission_id: str, body: DecideRequest):
    if body.decision not in ("accepted", "declined", "referred"):
        raise HTTPException(status_code=400, detail="Invalid decision — must be accepted, declined, or referred")

    record = await db.get_submission(submission_id)
    if not record:
        raise HTTPException(status_code=404, detail="Submission not found")

    now_iso = datetime.now(timezone.utc).isoformat()
    updates: dict = {
        "status": body.decision,
        "decision_by": body.actor,
        "decision_at": now_iso,
    }
    if body.notes:
        updates["notes"] = body.notes

    await db.update_submission(submission_id, updates)
    await db.add_audit_entry(
        submission_id, body.decision, body.actor,
        body.notes or f"Manual decision: {body.decision}",
    )

    return {"id": submission_id, "status": body.decision, "decision_at": now_iso}


@router.patch("/{submission_id}/notes")
async def update_notes(submission_id: str, notes: str = Body(..., embed=True)):
    record = await db.get_submission(submission_id)
    if not record:
        raise HTTPException(status_code=404, detail="Submission not found")
    await db.update_submission(submission_id, {"notes": notes})
    await db.add_audit_entry(submission_id, "notes_updated", "underwriter", "Underwriter notes updated")
    return {"id": submission_id, "notes": notes}


@router.get("/{submission_id}/audit")
async def get_audit(submission_id: str):
    entries = await db.get_audit_log(submission_id)
    return entries
