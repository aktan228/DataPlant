"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Camera,
  Upload,
  RefreshCw,
  Activity,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Leaf,
  Wifi,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { analyzeLeaf } from "@/lib/api";
import type { CropKey, DiagnosisResult, Locale } from "@/lib/types";

const CROPS: CropKey[] = ["apple", "apricot", "grape", "potato", "tomato"];

type Source = "cloud" | null;

export default function ScanPage() {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations("scan");
  const c = useTranslations("common");
  const cropT = useTranslations("crop");
  const premT = useTranslations("premium");
  const sevT = useTranslations("severity");
  const prioT = useTranslations("priority");

  const { canCloudScan, scansToday, freeScanLimit, prefs, registerCloudScan, addScan } = useApp();
  const scansLeft = prefs.tier === "premium" ? null : Math.max(0, freeScanLimit - scansToday);

  const [crop, setCrop] = useState<CropKey>("apple");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [source, setSource] = useState<Source>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const lastInput = useRef<{ b64: string; mime: string } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    setCameraActive(false);
  };
  useEffect(() => () => stopCamera(), []);

  function buildLocalScan(d: DiagnosisResult) {
    return {
      id: `scan-${Date.now()}`,
      crop,
      diseaseName: d.detectedDisease,
      confidence: d.confidence,
      severity: d.severity,
      recommendation: d.recommendation,
      recoDescription: d.recoDescription,
      recoTiming: d.recoTiming,
      actionRequired: d.actionRequired,
      priority: d.priority,
      createdAt: Date.now(),
      source: "cloud",
      synced: true,
    } as const;
  }

  async function runDiagnosis(b64: string, mime: string) {
    lastInput.current = { b64, mime };
    setError(null);
    setLimitHit(false);

    const online = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (!online) {
      setError(t("error"));
      return;
    }

    // ONLINE path: enforce freemium scan limit.
    if (!canCloudScan) {
      setLimitHit(true);
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await analyzeLeaf(b64, mime, crop, locale);
      registerCloudScan();
      setResult(res.analysis);
      setSource("cloud");
      addScan(res.scan ?? buildLocalScan(res.analysis));
    } catch {
      setError(t("error"));
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Re-run against the cloud to "refine" a preliminary offline result once
  // the user goes back online (offline toggle turned off).
  async function refineOnline() {
    if (!lastInput.current || !canCloudScan) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const { b64, mime } = lastInput.current;
      const res = await analyzeLeaf(b64, mime, crop, locale);
      registerCloudScan();
      setResult(res.analysis);
      setSource("cloud");
      addScan(res.scan ?? buildLocalScan(res.analysis));
    } catch {
      setError(t("error"));
    } finally {
      setIsAnalyzing(false);
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const data = reader.result as string;
      setImagePreview(data);
      runDiagnosis(data, file.type);
    };
    reader.readAsDataURL(file);
  }

  async function startCamera() {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      stopCamera();
      setError(t("error"));
    }
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL("image/png");
        setImagePreview(data);
        stopCamera();
        runDiagnosis(data, "image/png");
      }
    }
  }

  const sevColor =
    result?.severity === "High"
      ? "text-rose-600"
      : result?.severity === "Moderate"
        ? "text-amber-600"
        : "text-emerald-700";

  return (
    <div className="flex flex-col bg-cream pb-24">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200/50 bg-white px-5 py-4">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            {t("kicker")}
          </span>
          <h2 className="text-lg font-bold text-neutral-800">{t("title")}</h2>
        </div>
        <button
          onClick={refineOnline}
          className="flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-[10px] font-bold text-brand transition-all"
        >
          <Wifi className="h-3.5 w-3.5" />
          {c("online")}
        </button>
      </header>

      <div className="space-y-4 p-4">
        {scansLeft !== null && (
          <div className="flex items-center justify-center gap-1.5 rounded-xl bg-brand/5 px-3 py-2 text-[10px] font-semibold text-brand">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{premT("scansLeft", { count: scansLeft })}</span>
          </div>
        )}

        {/* Crop selector */}
        <div className="rounded-3xl border border-slate-200/50 bg-white p-3 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500">{t("targetCrop")}</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {CROPS.map((c) => (
              <button
                key={c}
                onClick={() => setCrop(c)}
                className={`rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all ${
                  crop === c ? "bg-brand text-white shadow-xs" : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {cropT(c)}
              </button>
            ))}
          </div>
        </div>

        {/* Viewfinder */}
        <div className="flex flex-col items-center rounded-3xl border border-slate-200/50 bg-white p-4 shadow-sm">
          {cameraActive ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-neutral-800 bg-black">
              <div className="pointer-events-none absolute inset-0 m-6 flex items-center justify-center rounded-xl border-2 border-dashed border-brand/40">
                <div className="h-1.5 w-1.5 animate-ping rounded-full bg-brand" />
              </div>
              <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-3">
                <button
                  onClick={capture}
                  className="flex items-center gap-1 rounded-full bg-white px-4 py-2 text-[10px] font-bold text-neutral-800 shadow-lg active:scale-95"
                >
                  <Camera className="h-3.5 w-3.5" /> {t("snap")}
                </button>
                <button
                  onClick={stopCamera}
                  className="rounded-full border border-white/20 bg-neutral-800/80 px-3 py-2 text-[10px] font-bold text-white shadow-lg"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col items-center py-4">
              {imagePreview ? (
                <div className="relative aspect-square w-full max-w-[240px] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="leaf" className="h-full w-full object-cover" />
                  {isAnalyzing && <AnalyzingOverlay label={t("analyzing")} />}
                </div>
              ) : (
                <div className="relative flex aspect-square w-full max-w-[240px] flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-green-600 p-5 text-center text-white">
                  <Leaf className="mb-2 h-10 w-10 opacity-90" strokeWidth={1.2} />
                  <p className="text-xs font-bold">{t("noLeaf")}</p>
                  <p className="mt-1 max-w-[160px] text-[10px] text-white/80">{t("noLeafHint")}</p>
                  {isAnalyzing && <AnalyzingOverlay label={t("analyzing")} />}
                </div>
              )}

              <div className="mt-5 flex gap-2.5">
                <button
                  onClick={startCamera}
                  className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-brand-dark active:scale-95"
                >
                  <Camera className="h-4 w-4" /> {t("startCamera")}
                </button>
                <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-neutral-700 shadow-xs transition-all hover:bg-neutral-50">
                  <Upload className="h-4 w-4 text-neutral-400" /> {t("uploadLeaf")}
                  <input type="file" accept="image/*" onChange={onFile} className="hidden" />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Banners */}
        {error && (
          <Banner tone="rose" icon={<AlertCircle className="h-4 w-4" />}>{error}</Banner>
        )}
        {limitHit && (
          <Banner tone="amber" icon={<Sparkles className="h-4 w-4" />} title={premT("freeLimitTitle")}>
            {premT("freeLimitDesc", { limit: freeScanLimit })}
          </Banner>
        )}
        {/* Diagnosis result */}
        {result && (
          <div className="space-y-4 rounded-3xl border border-slate-200/50 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                    {t("diagnosis")}
                  </span>
                  {source === "cloud" && (
                    <span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[8px] font-bold uppercase text-brand">
                      {t("refinedBadge")}
                    </span>
                  )}
                </div>
                <h3 className="mt-0.5 text-base font-bold text-neutral-800">{result.detectedDisease}</h3>
                <p className="mt-0.5 text-[10px] italic text-neutral-500">{result.scientificName}</p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold text-brand">
                  <Activity className="h-3.5 w-3.5" />
                  <span>{result.confidence}%</span>
                </div>
                <p className="mt-1 font-mono text-[8px] font-bold uppercase tracking-wider text-neutral-400">
                  {c("confidence")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="rounded-xl border border-neutral-100 bg-cream/60 p-3">
                <span className="block font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                  {t("affectedScope")}
                </span>
                <span className="mt-1 block text-xs font-semibold text-neutral-700">{result.affectedArea}</span>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-cream/60 p-3">
                <span className="block font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                  {t("dangerLevel")}
                </span>
                <span className={`mt-1 block text-xs font-bold ${sevColor}`}>{sevT(result.severity)}</span>
              </div>
            </div>

            <div>
              <h4 className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                {t("observedSymptoms")}
              </h4>
              <ul className="space-y-1.5">
                {result.symptoms.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-neutral-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200/50 bg-cream p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-brand">
                  {t("prescribes")}
                </span>
                <span className="rounded-md bg-neutral-200 px-2 py-0.5 font-mono text-[8px] font-bold uppercase text-neutral-600">
                  {t("priority")}: {prioT(result.priority)}
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-800">{result.recommendation}</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">{result.recoDescription}</p>
              <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-slate-200/40 pt-3 text-[10px] text-neutral-600">
                <div>
                  <span className="block font-mono text-[8px] font-semibold uppercase text-neutral-400">
                    {t("idealTiming")}
                  </span>
                  <span className="mt-0.5 block font-semibold text-neutral-700">{result.recoTiming}</span>
                </div>
                <div>
                  <span className="block font-mono text-[8px] font-semibold uppercase text-neutral-400">
                    {t("fieldAction")}
                  </span>
                  <span className="mt-0.5 block font-semibold text-neutral-700">{result.actionRequired}</span>
                </div>
              </div>
              <button
                onClick={() => router.push("/recommendations")}
                className="mt-4 flex w-full items-center justify-between rounded-xl bg-brand px-4 py-2.5 text-[10px] font-bold text-white shadow-xs transition-all hover:bg-brand-dark"
              >
                <span>{t("toTreatment")}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyzingOverlay({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 text-center text-white">
      <RefreshCw className="mb-2 h-8 w-8 animate-spin text-brand" />
      <span className="animate-pulse font-mono text-[11px] font-bold uppercase tracking-widest text-brand">
        {label}
      </span>
    </div>
  );
}

function Banner({
  tone,
  icon,
  title,
  children,
}: {
  tone: "rose" | "amber" | "sky";
  icon: React.ReactNode;
  title?: string;
  children: React.ReactNode;
}) {
  const tones = {
    rose: "bg-rose-50 border-rose-200 text-rose-800",
    amber: "bg-amber-50/80 border-amber-200 text-amber-900",
    sky: "bg-sky-50 border-sky-200 text-sky-800",
  };
  return (
    <div className={`flex items-start gap-2 rounded-xl border p-3 text-[11px] leading-relaxed ${tones[tone]}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        {title && <span className="block font-bold">{title}</span>}
        <span>{children}</span>
      </div>
    </div>
  );
}
