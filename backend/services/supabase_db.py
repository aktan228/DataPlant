"""Supabase REST helpers for persisted scan history."""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any

import httpx


def _settings() -> tuple[str, str] | None:
    url = os.environ.get("SUPABASE_URL", "").strip().rstrip("/")
    key = (
        os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
        or os.environ.get("SUPABASE_KEY", "").strip()
    )
    if not url or not key:
        return None
    return url, key


def is_configured() -> bool:
    return _settings() is not None


def _headers(key: str) -> dict[str, str]:
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


def _scan_to_record(row: dict[str, Any]) -> dict[str, Any]:
    created_at = row.get("created_at")
    created_ms = int(datetime.now(timezone.utc).timestamp() * 1000)
    if created_at:
        try:
            created_ms = int(datetime.fromisoformat(created_at.replace("Z", "+00:00")).timestamp() * 1000)
        except ValueError:
            pass

    return {
        "id": str(row["id"]),
        "crop": row["crop"],
        "diseaseName": row["disease_name"],
        "confidence": row["confidence"],
        "severity": row["severity"],
        "recommendation": row.get("recommendation"),
        "recoDescription": row.get("reco_description"),
        "recoTiming": row.get("reco_timing"),
        "actionRequired": row.get("action_required"),
        "priority": row.get("priority"),
        "createdAt": created_ms,
        "source": "cloud",
        "synced": True,
    }


async def save_scan(crop: str, diagnosis: dict[str, Any]) -> dict[str, Any] | None:
    settings = _settings()
    if settings is None:
        return None

    url, key = settings
    payload = {
        "crop": crop,
        "disease_name": diagnosis["detectedDisease"],
        "confidence": diagnosis["confidence"],
        "severity": diagnosis["severity"],
        "recommendation": diagnosis.get("recommendation"),
        "reco_description": diagnosis.get("recoDescription"),
        "reco_timing": diagnosis.get("recoTiming"),
        "action_required": diagnosis.get("actionRequired"),
        "priority": diagnosis.get("priority"),
        "source": "cloud",
        "synced": True,
    }

    async with httpx.AsyncClient(timeout=8) as http:
        resp = await http.post(
            f"{url}/rest/v1/scans",
            headers={**_headers(key), "Prefer": "return=representation"},
            json=payload,
        )
        resp.raise_for_status()
        rows = resp.json()
        return _scan_to_record(rows[0]) if rows else None


async def list_scans(limit: int = 50) -> list[dict[str, Any]]:
    settings = _settings()
    if settings is None:
        return []

    url, key = settings
    async with httpx.AsyncClient(timeout=8) as http:
        resp = await http.get(
            f"{url}/rest/v1/scans",
            headers=_headers(key),
            params={
                "select": "*",
                "order": "created_at.desc",
                "limit": str(limit),
            },
        )
        resp.raise_for_status()
        return [_scan_to_record(row) for row in resp.json()]
