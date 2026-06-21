"""DataPlant FastAPI backend — AI plant-disease diagnosis service.

Run (dev):  uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import analyze, scans, weather
from services.gemini import get_client
from services.supabase_db import is_configured as supabase_configured

load_dotenv()

app = FastAPI(title="DataPlant API", version="0.2.0")

frontend_origin = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)
app.include_router(scans.router)
app.include_router(weather.router)


@app.get("/api/health")
async def health() -> dict:
    return {
        "status": "ok",
        "time": datetime.now(timezone.utc).isoformat(),
        "aiConfigured": get_client() is not None,
        "model": os.environ.get("OPENROUTER_MODEL", "google/gemini-2.5-flash"),
        "weatherConfigured": bool(os.environ.get("OWM_API_KEY", "").strip()),
        "supabaseConfigured": supabase_configured(),
    }
