"""Pydantic request/response models for the DataPlant analysis API.

The response shape mirrors the contract consumed by the frontend Scan screen
(see frontend/src/lib/types.ts -> DiagnosisResult).
"""

from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field

Locale = Literal["ru", "ky", "en"]


class AnalyzeRequest(BaseModel):
    imageBase64: str = Field(..., description="Data URL or raw base64 of the leaf image")
    mimeType: str = "image/png"
    cropType: str = "Яблоня"
    locale: Locale = "ru"


class Diagnosis(BaseModel):
    detectedDisease: str
    scientificName: str
    confidence: int = Field(..., ge=0, le=100)
    affectedArea: str
    severity: Literal["Low", "Moderate", "High"]
    symptoms: List[str]
    recommendation: str
    priority: Literal["High", "Medium", "Low"]
    recoDescription: str
    recoTiming: str
    actionRequired: str


class AnalyzeResponse(BaseModel):
    analysis: Diagnosis
    scan: Optional[Dict[str, Any]] = None
