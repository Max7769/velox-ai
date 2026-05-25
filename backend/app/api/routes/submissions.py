from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.document_parser import extract_text
from app.services.ai_extractor import extract_submission_data
from app.models.submission import ExtractedData

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post("/extract", response_model=ExtractedData)
async def extract_submission(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    allowed = {"pdf", "doc", "docx", "txt"}
    ext = file.filename.lower().split(".")[-1]
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"File type .{ext} not supported")

    contents = await file.read()
    text = extract_text(contents, file.filename)

    if not text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from document")

    return await extract_submission_data(text)


@router.get("/health")
async def health():
    return {"status": "ok"}
