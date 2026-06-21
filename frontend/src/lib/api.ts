import type { CropKey, DiagnosisResult, ForecastDay, Locale, Localized } from "./types";

/** Crop key -> label the backend understands (it normalises any language). */
const CROP_LABEL: Record<CropKey, string> = {
  apple: "apple",
  apricot: "apricot",
  grape: "grape",
  potato: "potato",
  tomato: "tomato",
};

// ─── AI Analysis ─────────────────────────────────────────────────────────────

export interface AnalyzeResponse {
  analysis: DiagnosisResult;
}

/**
 * Send a leaf image to the FastAPI backend for cloud diagnosis.
 * Requests are proxied via Next.js rewrites (/api/* -> FastAPI).
 */
export async function analyzeLeaf(
  imageBase64: string,
  mimeType: string,
  crop: CropKey,
  locale: Locale,
): Promise<AnalyzeResponse> {
  const res = await fetch("/api/analyze-leaf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64,
      mimeType,
      cropType: CROP_LABEL[crop],
      locale,
    }),
  });
  if (!res.ok) throw new Error(`Diagnosis service error: ${res.status}`);
  return res.json();
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Weather ─────────────────────────────────────────────────────────────────

export interface ApiWeather {
  temp: number;
  humidity: number;
  windSpeed: number;
  pressure?: number;
  conditions: Localized;
}

export async function fetchWeather(): Promise<ApiWeather> {
  const res = await fetch("/api/weather", { cache: "no-store" });
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  return res.json();
}

// ─── Forecast ────────────────────────────────────────────────────────────────

/** Extends ForecastDay with extra fields the backend includes. */
export interface ApiForecastDay extends ForecastDay {
  date: string;
  windSpeed?: number;
  rain?: number;
  conditions?: string;
}

export async function fetchForecast(): Promise<ApiForecastDay[]> {
  const res = await fetch("/api/forecast", { cache: "no-store" });
  if (!res.ok) throw new Error(`Forecast API error: ${res.status}`);
  return res.json();
}

// ─── Disease Risk ─────────────────────────────────────────────────────────────

export interface CropRisk {
  disease: Localized;
  riskScore: number;
  level: "low" | "medium" | "high";
}

export interface DiseaseRiskResponse {
  weather: ApiWeather;
  risks: Record<string, CropRisk>;
}

export async function fetchDiseaseRisk(): Promise<DiseaseRiskResponse> {
  const res = await fetch("/api/disease-risk", { cache: "no-store" });
  if (!res.ok) throw new Error(`Disease risk API error: ${res.status}`);
  return res.json();
}
