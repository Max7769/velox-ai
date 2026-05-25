"""
Supabase database service.
Provides a typed interface for all DB operations.
Falls back to in-memory store when credentials are not configured.
"""
from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

# Lazy import — only fails if supabase package missing, not if keys unset
try:
    from supabase import create_client, Client as SupabaseClient
    _SUPABASE_AVAILABLE = True
except ImportError:
    _SUPABASE_AVAILABLE = False

from app.core.config import settings

# ── helpers ──────────────────────────────────────────────────────────────────

def _is_configured() -> bool:
    url = getattr(settings, "supabase_url", "")
    key = getattr(settings, "supabase_service_key", "")
    return (
        _SUPABASE_AVAILABLE
        and bool(url)
        and bool(key)
        and url != "placeholder"
        and url.startswith("https://")
    )


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── client singleton ─────────────────────────────────────────────────────────

_client: Optional[Any] = None

def get_client() -> Any:
    global _client
    if _client is None and _is_configured():
        _client = create_client(settings.supabase_url, settings.supabase_service_key)
    return _client


# ── in-memory fallback ───────────────────────────────────────────────────────

_mem: dict[str, dict] = {}
_audit_mem: list[dict] = []


def _new_id() -> str:
    return f"VLX-{uuid.uuid4().hex[:4].upper()}"


# ── submission operations ─────────────────────────────────────────────────────

async def create_submission(
    broker_name: str,
    broker_email: str,
    broker_company: str,
    file_name: str,
    status: str = "processing",
) -> dict:
    sub_id = _new_id()
    now = _now_iso()
    record = {
        "id": sub_id,
        "broker_name": broker_name,
        "broker_email": broker_email,
        "broker_company": broker_company,
        "file_name": file_name,
        "status": status,
        "score": None,
        "extracted_data": None,
        "notes": None,
        "decision_by": None,
        "decision_at": None,
        "processed_at": None,
        "created_at": now,
        "updated_at": now,
    }
    db = get_client()
    if db:
        try:
            result = db.table("submissions").insert(record).execute()
            return result.data[0] if result.data else record
        except Exception as e:
            print(f"[DB] create_submission error: {e} — using memory")
    _mem[sub_id] = record
    return record


async def update_submission(sub_id: str, updates: dict) -> dict:
    updates["updated_at"] = _now_iso()
    db = get_client()
    if db:
        try:
            result = db.table("submissions").update(updates).eq("id", sub_id).execute()
            return result.data[0] if result.data else updates
        except Exception as e:
            print(f"[DB] update_submission error: {e} — using memory")
    if sub_id in _mem:
        _mem[sub_id].update(updates)
    return {**_mem.get(sub_id, {}), **updates}


async def get_submission(sub_id: str) -> Optional[dict]:
    db = get_client()
    if db:
        try:
            result = db.table("submissions").select("*").eq("id", sub_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"[DB] get_submission error: {e} — using memory")
    return _mem.get(sub_id)


async def list_submissions(limit: int = 100) -> list[dict]:
    db = get_client()
    if db:
        try:
            result = (
                db.table("submissions")
                .select("*")
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            return result.data or []
        except Exception as e:
            print(f"[DB] list_submissions error: {e} — using memory")
    return sorted(_mem.values(), key=lambda x: x.get("created_at", ""), reverse=True)


# ── audit log ────────────────────────────────────────────────────────────────

async def add_audit_entry(
    submission_id: str,
    action: str,
    actor: str,
    detail: str | None = None,
) -> dict:
    entry = {
        "id": str(uuid.uuid4()),
        "submission_id": submission_id,
        "action": action,
        "actor": actor,
        "detail": detail,
        "created_at": _now_iso(),
    }
    db = get_client()
    if db:
        try:
            db.table("audit_log").insert(entry).execute()
            return entry
        except Exception as e:
            print(f"[DB] add_audit_entry error: {e}")
    _audit_mem.append(entry)
    return entry


async def get_audit_log(submission_id: str) -> list[dict]:
    db = get_client()
    if db:
        try:
            result = (
                db.table("audit_log")
                .select("*")
                .eq("submission_id", submission_id)
                .order("created_at")
                .execute()
            )
            return result.data or []
        except Exception as e:
            print(f"[DB] get_audit_log error: {e}")
    return [e for e in _audit_mem if e["submission_id"] == submission_id]


# ── appetite rules ────────────────────────────────────────────────────────────

async def get_rules() -> list[dict]:
    db = get_client()
    if db:
        try:
            result = (
                db.table("appetite_rules")
                .select("*")
                .eq("active", True)
                .order("priority")
                .execute()
            )
            return result.data or []
        except Exception as e:
            print(f"[DB] get_rules error: {e}")
    return []


# ── status check ──────────────────────────────────────────────────────────────

def db_status() -> dict:
    configured = _is_configured()
    return {
        "configured": configured,
        "mode": "supabase" if configured else "memory",
        "submissions_in_memory": len(_mem),
    }
