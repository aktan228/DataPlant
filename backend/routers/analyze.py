"""/api/analyze-leaf route: live AI diagnosis only."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from schemas import AnalyzeRequest, AnalyzeResponse, Diagnosis
from services.gemini import analyze_image
from services.supabase_db import save_scan

router = APIRouter(prefix="/api", tags=["analyze"])


@router.post("/analyze-leaf", response_model=AnalyzeResponse)
async def analyze_leaf(req: AnalyzeRequest) -> AnalyzeResponse:
    if not req.imageBase64:
        raise HTTPException(status_code=400, detail="No image content provided.")

    analysis = await analyze_image(req.imageBase64, req.mimeType, req.cropType, req.locale)

    if analysis is not None:
        try:
            diagnosis = Diagnosis(**analysis)
        except Exception:
            raise HTTPException(status_code=502, detail="AI diagnosis returned an invalid response.")

        saved_scan = None
        try:
            saved_scan = await save_scan(req.cropType, diagnosis.model_dump())
        except Exception as exc:
            print(f"[DataPlant] Supabase scan save error: {exc}")

        return AnalyzeResponse(analysis=diagnosis, scan=saved_scan)

    raise HTTPException(status_code=503, detail="Live AI diagnosis is unavailable.")
