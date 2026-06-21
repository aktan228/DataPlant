"""Persisted scan history and field zone routes."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from services.supabase_db import create_zone, list_scans, list_zones

router = APIRouter(prefix="/api", tags=["scans"])


@router.get("/scans")
async def scans(limit: int = Query(default=50, ge=1, le=100)) -> list[dict]:
    try:
        return await list_scans(limit)
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Supabase scans are unavailable.") from exc


@router.get("/zones")
async def zones() -> list[dict]:
    try:
        return await list_zones()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Supabase zones are unavailable.") from exc


class ZoneCreate(BaseModel):
    name_ru: str = Field(..., min_length=1, max_length=80)
    name_ky: str = Field(..., min_length=1, max_length=80)
    name_en: str = Field(..., min_length=1, max_length=80)
    crop: str = Field(..., pattern="^(apple|apricot|grape|potato|tomato)$")
    size_ha: float = Field(..., gt=0, le=10000)
    health_score: int = Field(default=85, ge=0, le=100)
    status: str = Field(default="healthy", pattern="^(healthy|atRisk|infected)$")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


@router.post("/zones", status_code=201)
async def create_zone_endpoint(body: ZoneCreate) -> dict:
    try:
        payload = body.model_dump()
        payload["id"] = f"zone-{uuid.uuid4().hex[:8]}"
        return await create_zone(payload)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to create zone.") from exc