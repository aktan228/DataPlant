"""Persisted scan history routes."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from services.supabase_db import list_scans

router = APIRouter(prefix="/api", tags=["scans"])


@router.get("/scans")
async def scans(limit: int = Query(default=50, ge=1, le=100)) -> list[dict]:
    try:
        return await list_scans(limit)
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Supabase scans are unavailable.") from exc
