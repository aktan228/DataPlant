export type Locale = "ru" | "ky" | "en";

/** A string available in all three supported languages. */
export type Localized = Record<Locale, string>;
export type LocalizedList = Record<Locale, string[]>;

export type CropKey = "apple" | "apricot" | "grape" | "potato" | "tomato";
export type ZoneStatus = "healthy" | "atRisk" | "infected";
export type ZoneColor = "green" | "yellow" | "red";
export type Severity = "Low" | "Moderate" | "High";
export type Priority = "High" | "Medium" | "Low";

export interface DiseaseRisk {
  name: Localized;
  scientificName: string;
  probability: number; // 0-100
  affectedArea: Localized;
  severity: Severity;
  symptoms: LocalizedList;
}

export interface FieldZone {
  id: string;
  name: Localized;
  crop: CropKey;
  healthScore: number; // 0-100
  status: ZoneStatus;
  color: ZoneColor;
  sizeHa: number; // hectares
  latitude: number;
  longitude: number;
  densityPercentage: number;
  diseaseRisks: DiseaseRisk[];
}

export interface WeatherInfo {
  temp: number;
  humidity: number;
  windSpeed: number;
  conditions: Localized;
  uvIndex: Localized;
}

export interface Recommendation {
  id: string;
  title: Localized;
  category: "Chemical" | "Organic" | "Preventative" | "Cultural";
  priority: Priority;
  description: Localized;
  timing: Localized;
  applicability: Localized;
}

export interface OutbreakHistory {
  date: string;
  zoneName: Localized;
  diseaseName: Localized;
  affectedHa: number;
  resolvedDate: string;
  treatmentUsed: Localized;
}

export interface MonthTrend {
  month: Localized;
  healthIndex: number;
  rainfallMm: number;
  droneFlights: number;
}

export interface ForecastDay {
  day: Localized;
  riskLevel: number; // 0-100
  disease: Localized;
  humidity: number;
  temp: number;
}

export interface NotificationAlert {
  id: string;
  title: Localized;
  message: Localized;
  severity: "highRisk" | "warning" | "routine";
  time: Localized;
  unread: boolean;
  zone?: Localized;
}

export interface DroneProfile {
  id: string;
  name: string;
  model: string;
  battery: number;
  status: "ready" | "scanning" | "charging" | "offline";
  lastFlight: Localized;
  scanAltitudeMeters: number;
  speedMetersPerSec: number;
  cameraType: string;
}

export type Tier = "free" | "premium";

export interface UserPreferences {
  userName: string;
  farmName: string;
  location: string;
  tier: Tier;
  notifyOnHighRisk: boolean;
  droneAutoLaunch: boolean;
}

/** Diagnosis result returned by the backend /api/analyze-leaf (already localized). */
export interface DiagnosisResult {
  detectedDisease: string;
  scientificName: string;
  confidence: number;
  affectedArea: string;
  severity: Severity;
  symptoms: string[];
  recommendation: string;
  priority: Priority;
  recoDescription: string;
  recoTiming: string;
  actionRequired: string;
}

export interface ScanRecord {
  id: string;
  crop: CropKey;
  diseaseName: string;
  confidence: number;
  severity: Severity;
  recommendation?: string;
  recoDescription?: string;
  recoTiming?: string;
  actionRequired?: string;
  priority?: Priority;
  createdAt: number; // epoch ms
  source: "cloud";
  synced: boolean;
}
