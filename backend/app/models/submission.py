from pydantic import BaseModel
from datetime import datetime
from enum import Enum


class SubmissionStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    accepted = "accepted"
    declined = "declined"
    referred = "referred"


class SubmissionCreate(BaseModel):
    broker_name: str
    broker_email: str
    insured_name: str
    coverage_type: str


class ExtractedData(BaseModel):
    insured_name: str | None = None
    coverage_type: str | None = None
    coverage_limit: str | None = None
    premium_estimate: str | None = None
    industry: str | None = None
    risk_factors: list[str] = []
    loss_history: str | None = None
    effective_date: str | None = None
    confidence_score: float = 0.0


class Submission(BaseModel):
    id: str
    broker_name: str
    broker_email: str
    status: SubmissionStatus
    extracted_data: ExtractedData | None = None
    created_at: datetime
    updated_at: datetime
