from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.routes import submissions, email_webhook


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Velox AI API starting up")
    yield
    print("Velox AI API shutting down")


app = FastAPI(
    title="Velox AI API",
    description="AI-powered insurance submission intake for the Lloyd's market",
    version="0.2.0",
    lifespan=lifespan,
)

try:
    from app.core.config import settings
    _origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
except Exception:
    _origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(submissions.router, prefix="/api/v1")
app.include_router(email_webhook.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"service": "velox-ai", "version": "0.2.0", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
