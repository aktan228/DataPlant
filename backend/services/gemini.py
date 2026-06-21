"""OpenRouter AI client (OpenAI-compatible) with lazy initialisation."""

from __future__ import annotations

import json
import os
from typing import Optional

_client = None

LOCALE_NAMES = {"ru": "Russian (русский)", "ky": "Kyrgyz (кыргызча)", "en": "English"}


def get_client():
    """Lazily build and cache an OpenAI-compatible client pointed at OpenRouter."""
    global _client
    if _client is not None:
        return _client

    key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not key or key.startswith("your"):
        return None

    try:
        from openai import AsyncOpenAI

        _client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=key,
        )
        return _client
    except Exception as exc:
        print(f"[DataPlant] Failed to init OpenRouter client: {exc}")
        return None


def _system_instruction(locale: str) -> str:
    lang = LOCALE_NAMES.get(locale, LOCALE_NAMES["ru"])
    return f"""You are an expert plant pathologist and agronomist working with farms in Kyrgyzstan
(apple, apricot, grape, potato and vegetable crops). Analyse the provided leaf/plant image
for agricultural plant diseases with scientific precision and give actionable guidance for farmers.

Write ALL human-readable text fields in {lang}. Keep scientificName in Latin.

Return a VALID JSON object exactly matching this structure (raw JSON, no markdown fences):
{{
  "detectedDisease": "Common disease name (or healthy equivalent in {lang} if no disease found)",
  "scientificName": "Latin nomenclature, or 'N/A' if healthy",
  "confidence": 95,
  "affectedArea": "Approximate affected parts described in {lang}",
  "severity": "Low",
  "symptoms": ["symptom 1 in {lang}", "symptom 2 in {lang}", "symptom 3 in {lang}"],
  "recommendation": "Main treatment name in {lang}",
  "priority": "High",
  "recoDescription": "Actionable treatment instructions in {lang}.",
  "recoTiming": "Optimal application time and conditions in {lang}",
  "actionRequired": "Concise immediate physical action in {lang}."
}}

severity must be exactly one of: "Low", "Moderate", "High"
priority must be exactly one of: "Low", "Medium", "High"
confidence must be an integer 0-100"""


async def analyze_image(image_base64: str, mime_type: str, crop_type: str, locale: str) -> Optional[dict]:
    """Call OpenRouter to analyse the leaf image. Returns parsed dict or None on failure."""
    client = get_client()
    if client is None:
        return None

    cleaned = image_base64
    if "," in cleaned and cleaned.strip().startswith("data:"):
        cleaned = cleaned.split(",", 1)[1]

    model = os.environ.get("OPENROUTER_MODEL", "google/gemini-2.5-flash")
    site_url = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": _system_instruction(locale)},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                f"Analyse this {crop_type} leaf/plant sample. "
                                "Return the crop-disease diagnosis as a JSON object."
                            ),
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime_type or 'image/png'};base64,{cleaned}"},
                        },
                    ],
                },
            ],
            temperature=0.1,
            extra_headers={
                "HTTP-Referer": site_url,
                "X-Title": "DataPlant",
            },
        )
        content = response.choices[0].message.content or "{}"
        text = content.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception as exc:
        print(f"[DataPlant] OpenRouter analysis error: {exc}")
        return None
