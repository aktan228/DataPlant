"""OpenWeatherMap integration with agronomic disease-risk rules."""

from __future__ import annotations

import os
from datetime import datetime
from typing import Optional

import httpx

OWM_BASE = "https://api.openweathermap.org/data/2.5"

_DAY_NAMES = [
    {"ru": "Mon", "ky": "Mon", "en": "Mon"},
    {"ru": "Tue", "ky": "Tue", "en": "Tue"},
    {"ru": "Wed", "ky": "Wed", "en": "Wed"},
    {"ru": "Thu", "ky": "Thu", "en": "Thu"},
    {"ru": "Fri", "ky": "Fri", "en": "Fri"},
    {"ru": "Sat", "ky": "Sat", "en": "Sat"},
    {"ru": "Sun", "ky": "Sun", "en": "Sun"},
]

_DISEASE_NAMES: dict[str, dict[str, str]] = {
    "apple": {"ru": "Apple Scab", "ky": "Apple Scab", "en": "Apple Scab"},
    "potato": {"ru": "Late Blight", "ky": "Late Blight", "en": "Late Blight"},
    "grape": {"ru": "Downy Mildew", "ky": "Downy Mildew", "en": "Downy Mildew"},
    "apricot": {"ru": "Brown Rot", "ky": "Brown Rot", "en": "Brown Rot"},
    "tomato": {"ru": "Early Blight", "ky": "Early Blight", "en": "Early Blight"},
}


def _owm_key() -> Optional[str]:
    key = os.environ.get("OWM_API_KEY", "").strip()
    return key if key and not key.startswith("your") else None


def _require_owm_key() -> str:
    key = _owm_key()
    if key is None:
        raise RuntimeError("OWM_API_KEY is not configured.")
    return key


def _per_crop_scores(temp: float, humidity: float, rain: float) -> dict[str, int]:
    """Agronomic disease risk scores (0-100) per crop based on weather thresholds."""
    return {
        "apple": 80 if temp > 15 and humidity > 80 else 50 if temp > 6 and humidity > 70 else 20,
        "potato": 85 if 10 < temp < 24 and (humidity > 90 or rain > 0) else 55 if 10 < temp < 24 and humidity > 75 else 15,
        "grape": 78 if temp > 11 and (rain > 5 or humidity > 85) else 45 if temp > 11 and humidity > 70 else 18,
        "apricot": 72 if 15 < temp < 25 and humidity > 80 else 40 if 10 < temp < 25 else 15,
        "tomato": 70 if temp > 24 and humidity > 85 else 42 if temp > 20 and humidity > 70 else 18,
    }


def _top_risk(scores: dict[str, int]) -> tuple[int, str]:
    top = max(scores, key=lambda k: scores[k])
    return scores[top], top


def _build_forecast_item(
    date: datetime, temp: float, humidity: float, wind_speed: float, rain: float, conditions: str
) -> dict:
    scores = _per_crop_scores(temp, humidity, rain)
    risk, top_crop = _top_risk(scores)
    return {
        "day": _DAY_NAMES[date.weekday()],
        "date": date.strftime("%Y-%m-%d"),
        "riskLevel": risk,
        "disease": _DISEASE_NAMES[top_crop],
        "humidity": round(humidity),
        "temp": round(temp),
        "windSpeed": round(wind_speed, 1),
        "rain": round(rain, 1),
        "conditions": conditions,
    }


async def get_current_weather(lat: float, lon: float) -> dict:
    key = _require_owm_key()
    try:
        async with httpx.AsyncClient(timeout=8) as http:
            resp = await http.get(
                f"{OWM_BASE}/weather",
                params={"lat": lat, "lon": lon, "appid": key, "units": "metric", "lang": "ru"},
            )
            resp.raise_for_status()
            d = resp.json()
            ru_desc = d["weather"][0]["description"]
            en_desc = d["weather"][0]["main"]
            return {
                "temp": round(d["main"]["temp"]),
                "humidity": d["main"]["humidity"],
                "windSpeed": round(d["wind"]["speed"], 1),
                "pressure": d["main"]["pressure"],
                "conditions": {"ru": ru_desc, "ky": ru_desc, "en": en_desc},
            }
    except Exception as exc:
        print(f"[DataPlant] OWM current weather error: {exc}")
        raise RuntimeError("OpenWeatherMap current weather is unavailable.") from exc


async def get_forecast(lat: float, lon: float) -> list[dict]:
    key = _require_owm_key()
    try:
        async with httpx.AsyncClient(timeout=8) as http:
            resp = await http.get(
                f"{OWM_BASE}/forecast",
                params={"lat": lat, "lon": lon, "appid": key, "units": "metric", "cnt": 40},
            )
            resp.raise_for_status()
            data = resp.json()

        days: dict[str, dict] = {}
        for item in data["list"]:
            day_str = item["dt_txt"][:10]
            if day_str not in days or "12:00" in item["dt_txt"]:
                days[day_str] = {
                    "temp": item["main"]["temp"],
                    "humidity": item["main"]["humidity"],
                    "windSpeed": item["wind"]["speed"],
                    "rain": item.get("rain", {}).get("3h", 0.0),
                    "conditions": item["weather"][0]["description"],
                }

        result = []
        for day_str, d in list(days.items())[:5]:
            dt = datetime.strptime(day_str, "%Y-%m-%d")
            result.append(
                _build_forecast_item(dt, d["temp"], d["humidity"], d["windSpeed"], d["rain"], d["conditions"])
            )
        return result
    except Exception as exc:
        print(f"[DataPlant] OWM forecast error: {exc}")
        raise RuntimeError("OpenWeatherMap forecast is unavailable.") from exc


async def get_disease_risk(lat: float, lon: float) -> dict:
    w = await get_current_weather(lat, lon)
    rain_est = 8.0 if w["humidity"] > 85 else 0.0
    scores = _per_crop_scores(w["temp"], w["humidity"], rain_est)
    risks = {
        crop: {
            "disease": _DISEASE_NAMES[crop],
            "riskScore": score,
            "level": "high" if score >= 70 else "medium" if score >= 40 else "low",
        }
        for crop, score in scores.items()
    }
    return {"weather": w, "risks": risks}
