"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Navigation, Scan, Compass, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";
import { useLoc } from "@/lib/i18nText";
import StatusPill from "@/components/StatusPill";
import ScreenHeader from "@/components/ScreenHeader";

const STROKES = ["#10B981", "#EF4444", "#F59E0B", "#10B981"];
const FILLS = [
  "rgba(16,185,129,",
  "rgba(239,68,68,",
  "rgba(245,158,11,",
  "rgba(16,185,129,",
];
const POLYGONS = [
  "25,25 210,25 180,170 25,140",
  "225,25 375,25 375,190 200,190",
  "25,160 170,185 140,375 25,375",
  "190,210 375,210 375,375 160,375",
];
const LABEL_POS = [
  { x: 70, y: 85 },
  { x: 245, y: 90 },
  { x: 50, y: 265 },
  { x: 240, y: 285 },
];

export default function MapPage() {
  const t = useTranslations("map");
  const cropT = useTranslations("crop");
  const statusT = useTranslations("status");
  const sevT = useTranslations("severity");
  const loc = useLoc();
  const { zones, selectedZone, setSelectedZone } = useApp();

  const initial = selectedZone ?? zones[0] ?? null;
  const [activeId, setActiveId] = useState<string | null>(initial?.id ?? null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [healthBoost, setHealthBoost] = useState(0);

  const active = zones.find((z) => z.id === activeId) ?? zones[0] ?? null;

  function launchDrone() {
    setScanning(true);
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setTimeout(() => {
            setScanning(false);
            setHealthBoost((b) => Math.min(b + 2, 8));
          }, 500);
          return 100;
        }
        return p + 8;
      });
    }, 140);
  }

  return (
    <div className="flex flex-col bg-cream pb-24">
      <ScreenHeader
        kicker={t("kicker")}
        title={t("title")}
        right={
          <div className="flex items-center gap-1.5 rounded-full border border-neutral-200/50 bg-cream px-3 py-1.5">
            <Navigation className="h-3.5 w-3.5 rotate-45 text-brand" />
            <span className="font-mono text-[10px] font-bold text-neutral-600">42.87°N</span>
          </div>
        }
      />

      <div className="space-y-4 p-4">
        {zones.length === 0 && (
          <div className="rounded-3xl border border-slate-200/50 bg-white p-8 text-center text-sm text-neutral-400 shadow-sm">
            No live field map data yet.
          </div>
        )}

        {/* Vector field map */}
        {zones.length > 0 && (
        <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 shadow-md">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute right-4 top-4 z-10 rounded-xl border border-white/10 bg-black/40 p-2 text-white backdrop-blur-md">
            <Compass className="animate-spin-slow h-4 w-4 text-brand" />
          </div>
          <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[9px] text-white/80 backdrop-blur-md">
            {t("scale")}
          </div>

          <svg viewBox="0 0 400 400" className="relative z-0 h-full w-full">
            {zones.map((zone, i) => {
              const isActive = zone.id === activeId;
              return (
                <g key={zone.id} className="cursor-pointer" onClick={() => { setActiveId(zone.id); setSelectedZone(zone.id); }}>
                  <polygon
                    points={POLYGONS[i]}
                    fill={`${FILLS[i]}${isActive ? "0.28" : "0.1"})`}
                    stroke={STROKES[i]}
                    strokeWidth={isActive ? 3.5 : 1.8}
                    strokeDasharray={isActive ? "" : "3,3"}
                    className="transition-all duration-300"
                  />
                  <text x={LABEL_POS[i].x} y={LABEL_POS[i].y} fill="#fff" fontSize="11" fontWeight="bold" opacity="0.85">
                    {loc(zone.name)}
                  </text>
                  <text
                    x={LABEL_POS[i].x}
                    y={LABEL_POS[i].y + 16}
                    fill={STROKES[i]}
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {Math.min(zone.healthScore + (zone.id === activeId ? healthBoost : 0), 100)}%
                  </text>
                </g>
              );
            })}

            {scanning && (
              <g>
                <line x1="0" y1={20 + progress * 3.6} x2="400" y2={20 + progress * 3.6} stroke="rgba(34,197,94,0.6)" strokeWidth="4" />
                <g transform={`translate(${100 + Math.sin(progress) * 80}, ${20 + progress * 3.6})`}>
                  <polygon points="-15,0 15,0 45,90 -45,90" fill="rgba(52,211,153,0.15)" />
                  <circle cx="0" cy="0" r="10" fill="#2d5a27" stroke="#fafafa" strokeWidth="2" />
                  <circle cx="0" cy="0" r="3" fill="#fff" />
                </g>
              </g>
            )}
          </svg>

          {scanning && (
            <div className="absolute inset-x-0 bottom-12 z-10 mx-auto w-2/3 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-white backdrop-blur-md">
                <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
                <span className="font-mono text-[10px] font-bold tracking-wider">{t("scanProgress", { progress })}</span>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Sector detail */}
        {active && (
        <div className="space-y-4 rounded-3xl border border-slate-200/50 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                {t("targetSector")}
              </span>
              <h3 className="text-base font-bold text-neutral-800">{loc(active.name)}</h3>
              <p className="mt-0.5 text-xs text-neutral-500">
                {cropT(active.crop)} · {active.sizeHa} га
              </p>
            </div>
            <StatusPill status={active.status} label={statusT(active.status)} />
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-neutral-100 pt-2">
            {[
              { label: t("index"), value: `${Math.min(active.healthScore + healthBoost, 100)}%` },
              { label: t("density"), value: `${active.densityPercentage}%` },
              {
                label: t("riskLevel"),
                value:
                  active.status === "infected" ? t("riskHigh") : active.status === "atRisk" ? t("riskMid") : t("riskNone"),
              },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-neutral-200/20 bg-cream/60 p-2 text-center">
                <span className="block font-mono text-[9px] font-bold uppercase text-neutral-400">{s.label}</span>
                <span className="text-sm font-bold text-neutral-800">{s.value}</span>
              </div>
            ))}
          </div>

          <div>
            <h4 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              {t("detectedSpots")}
            </h4>
            <div className="space-y-2">
              {active.diseaseRisks.length > 0 ? (
                active.diseaseRisks.map((dr, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-neutral-200/50 bg-neutral-50 p-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-neutral-800">{loc(dr.name)}</span>
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[8px] font-bold ${
                            dr.severity === "High"
                              ? "bg-red-100 text-red-600"
                              : dr.severity === "Moderate"
                                ? "bg-amber-100 text-amber-600"
                                : "bg-green-100 text-green-600"
                          }`}
                        >
                          {sevT(dr.severity)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[9px] italic text-neutral-500">{dr.scientificName}</p>
                      <p className="mt-1 text-[9px] text-neutral-400">{loc(dr.affectedArea)}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-brand">{dr.probability}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-brand/10 bg-brand/5 p-3.5 text-center text-brand">
                  <Sparkles className="mx-auto mb-1 h-4 w-4" />
                  <p className="text-xs font-bold">{t("noPathology")}</p>
                  <p className="mt-1 text-[10px] text-brand/85">{t("noPathologyHint")}</p>
                </div>
              )}
            </div>
          </div>

          <button
            disabled={scanning}
            onClick={launchDrone}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-xs font-bold transition-all ${
              scanning
                ? "border border-cream-border bg-cream text-neutral-400"
                : "bg-brand text-white shadow-sm hover:bg-brand-dark active:scale-[0.98]"
            }`}
          >
            <Scan className="h-4 w-4" />
            <span>{scanning ? t("scanning") : t("triggerScan")}</span>
          </button>
        </div>
        )}
      </div>
    </div>
  );
}
