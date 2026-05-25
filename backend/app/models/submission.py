from pydantic import BaseModel, field_validator
from datetime import datetime
from enum import Enum
from typing import Optional


class SubmissionStatus(str, Enum):
    pending    = "pending"
    processing = "processing"
    accepted   = "accepted"
    declined   = "declined"
    referred   = "referred"


class ScoreFactor(BaseModel):
    label:  str
    impact: int          # -30 to +30
    detail: str


class PremiumModel(BaseModel):
    base:     int
    low:      int
    mid:      int
    high:     int
    currency: str = "GBP"
    basis:    str = ""


class ExtractedData(BaseModel):
    insured_name:     Optional[str]       = None
    coverage_type:    Optional[str]       = None
    coverage_limit:   Optional[str]       = None
    premium_estimate: Optional[str]       = None
    industry:         Optional[str]       = None
    risk_factors:     list[str]           = []
    loss_history:     Optional[str]       = None
    effective_date:   Optional[str]       = None
    confidence_score: float               = 0.0
    jurisdiction:     Optional[str]       = None
    employees:        Optional[str]       = None
    revenue:          Optional[str]       = None
    naics_code:       Optional[str]       = None
    score_factors:    list[ScoreFactor]   = []
    premium_model:    Optional[PremiumModel] = None

    @field_validator("confidence_score", mode="before")
    @classmethod
    def clamp_confidence(cls, v: float) -> float:
        return max(0.0, min(1.0, float(v)))


class SubmissionCreate(BaseModel):
    broker_name:    str
    broker_email:   str
    broker_company: str
    insured_name:   Optional[str] = None
    coverage_type:  Optional[str] = None


class Submission(BaseModel):
    id:             str
    broker_name:    str
    broker_email:   str
    broker_company: str
    status:         SubmissionStatus
    score:          Optional[int]           = None
    extracted_data: Optional[ExtractedData] = None
    file_name:      Optional[str]           = None
    notes:          Optional[str]           = None
    decision_by:    Optional[str]           = None
    decision_at:    Optional[datetime]      = None
    processed_at:   Optional[datetime]      = None
    created_at:     datetime
    updated_at:     datetime
