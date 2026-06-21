"""Weather and disease-risk routes."""

from __future__ import annotations

import os

from fastapi import APIRouter, HTTPException, Query

from services.weather import get_current_weather, get_forecast, get_disease_risk

router = APIRouter(prefix="/api", tags=["weather"])


def _coords(lat: float | None, lon: float | None) -> tuple[float, float]:
    return (
        lat if lat is not None else float(os.environ.get("FIELD_LAT", "42.87")),
        lon if lon is not None else float(os.environ.get("FIELD_LON", "74.59")),
    )


@router.get("/weather")
async def weather(lat: float | None = Query(default=None), lon: float | None = Query(default=None)) -> dict:
    la, lo = _coords(lat, lon)
    try:
        return await get_current_weather(la, lo)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/forecast")
async def forecast(lat: float | None = Query(default=None), lon: float | None = Query(default=None)) -> list:
    la, lo = _coords(lat, lon)
    try:
        return await get_forecast(la, lo)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/disease-risk")
async def disease_risk(lat: float | None = Query(default=None), lon: float | None = Query(default=None)) -> dict:
    la, lo = _coords(lat, lon)
    try:
        return await get_disease_risk(la, lo)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
