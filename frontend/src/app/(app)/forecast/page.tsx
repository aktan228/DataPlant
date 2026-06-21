"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CloudRain, TrendingUp, Droplets, Thermometer, Wind } from "lucide-react";
import { useLoc } from "@/lib/i18nText";
import { fetchForecast, type ApiForecastDay } from "@/lib/api";
import ScreenHeader from "@/components/ScreenHeader";
import PremiumGate from "@/components/PremiumGate";

function riskColor(r: number) {
  if (r >= 70) return "bg-rose-500";
  if (r >= 45) return "bg-amber-500";
  return "bg-emerald-500";
}

function riskLabel(r: number, t: (k: string) => string) {
  if (r >= 70) return t("riskHigh");
  if (r >= 45) return t("riskMid");
  return t("riskNone");
}

export default function ForecastPage() {
  const t = useTranslations("forecast");
  const loc = useLoc();

  const [days, setDays] = useState<ApiForecastDay[]>([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    fetchForecast()
      .then((data) => {
        setDays(data);
        setIsLive(true);
      })
      .catch(() => {});
  }, []);

  const peak = days.length
    ? days.reduce((a, b) => (b.riskLevel > a.riskLevel ? b : a), days[0])
    : null;

  return (
    <div className="flex flex-col bg-cream pb-24">
      <ScreenHeader kicker={t("kicker")} title={t("title")} />
      <PremiumGate>
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500">{t("subtitle")}</p>
            {isLive && (
              <span className="rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[8px] font-bold uppercase text-brand">
                live
              </span>
            )}
          </div>

          {days.length === 0 && (
            <div className="rounded-3xl border border-slate-200/50 bg-white p-8 text-center text-sm text-neutral-400 shadow-sm">
              Live forecast unavailable.
            </div>
          )}

          {/* Weekly risk chart */}
          {days.length > 0 && (
          <div className="rounded-3xl border border-slate-200/50 bg-white p-5 shadow-sm">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              {t("weeklyRisk")}
            </span>
            <div className="mt-4 flex h-40 items-end justify-between gap-2">
              {days.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[9px] font-bold text-neutral-500">{d.riskLevel}</span>
                  <div className="flex h-28 w-full items-end rounded-full bg-neutral-100">
                    <div
                      className={`w-full rounded-full ${riskColor(d.riskLevel)} transition-all`}
                      style={{ height: `${d.riskLevel}%` }}
                    />
                  </div>
                  <span className="font-mono text-[9px] font-semibold text-neutral-400">{loc(d.day)}</span>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Peak day callout */}
          {peak && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 to-rose-700 p-4 text-white shadow-lg">
            <div className="absolute bottom-0 right-0 translate-x-3 translate-y-3 opacity-15">
              <CloudRain className="h-28 w-28" />
            </div>
            <div className="relative z-10">
              <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider">
                {t("peakDay")} · {loc(peak.day)}
              </span>
              <h3 className="mt-2 flex items-center gap-1.5 text-lg font-extrabold">
                <TrendingUp className="h-5 w-5" /> {peak.riskLevel}% · {loc(peak.disease)}
              </h3>
              <p className="mt-1 max-w-[230px] text-xs text-white/85">{t("peakDesc")}</p>
              <div className="mt-3 flex gap-4 text-[11px] text-white/90">
                <span className="flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5" /> {t("humidity")}: {peak.humidity}%
                </span>
                <span className="flex items-center gap-1">
                  <Thermometer className="h-3.5 w-3.5" /> {t("temp")}: {peak.temp}°C
                </span>
              </div>
            </div>
          </div>
          )}

          {/* Daily list */}
          <div className="space-y-2">
            {days.map((d, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl border border-slate-200/40 bg-white p-3 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${riskColor(d.riskLevel)}`} />
                  <div>
                    <span className="text-xs font-bold text-neutral-800">{loc(d.day)}</span>
                    <p className="text-[10px] text-neutral-500">{loc(d.disease)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-brand" /> {d.humidity}%
                  </span>
                  {d.windSpeed !== undefined && (
                    <span className="flex items-center gap-1">
                      <Wind className="h-3 w-3 text-brand" /> {d.windSpeed}
                    </span>
                  )}
                  <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                    d.riskLevel >= 70
                      ? "bg-rose-100 text-rose-700"
                      : d.riskLevel >= 45
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {riskLabel(d.riskLevel, t)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PremiumGate>
    </div>
  );
}
