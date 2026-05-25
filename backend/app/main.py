from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import submissions

app = FastAPI(
    title="Velox AI API",
    description="Insurance submission intake API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(submissions.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"service": "velox-ai", "status": "running"}
