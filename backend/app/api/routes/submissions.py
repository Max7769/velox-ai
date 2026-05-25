from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from app.services.document_parser import extract_text
from app.services.ai_extractor import extract_submission_data
from app.services.scoring import compute_risk_score, apply_appetite
from app.models.submission import ExtractedData, SubmissionCreate
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/submissions", tags=["submissions"])

# In-memory store (replace with Supabase in production)
_store: dict = {}


class SubmissionResponse(BaseModel):
    id: str
    status: str
    score: Optional[int]
    extracted_data: Optional[ExtractedData]
    created_at: str


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

    sub_id = f"VLX-{uuid.uuid4().hex[:4].upper()}"
    now = datetime.utcnow().isoformat()

    _store[sub_id] = {
        "id": sub_id, "status": "processing",
        "broker_name": broker_name, "broker_email": broker_email,
        "broker_company": broker_company, "file_name": file.filename,
        "score": None, "extracted_data": None, "created_at": now,
    }

    extracted = await extract_submission_data(text)
    score = compute_risk_score(extracted)
    decision = apply_appetite(score, extracted)

    _store[sub_id].update({
        "status": decision, "score": score,
        "extracted_data": extracted, "processed_at": datetime.utcnow().isoformat(),
    })

    return SubmissionResponse(
        id=sub_id, status=decision, score=score,
        extracted_data=extracted, created_at=now,
    )


@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission(submission_id: str):
    sub = _store.get(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return SubmissionResponse(**sub)


@router.patch("/{submission_id}/decide")
async def decide_submission(submission_id: str, decision: str = Body(...), actor: str = Body("underwriter")):
    if decision not in ("accepted", "declined", "referred"):
        raise HTTPException(status_code=400, detail="Invalid decision")
    sub = _store.get(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    _store[submission_id].update({
        "status": decision, "decision_by": actor,
        "decision_at": datetime.utcnow().isoformat(),
    })
    return {"id": submission_id, "status": decision}


@router.get("/")
async def list_submissions():
    return list(_store.values())
