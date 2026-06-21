"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Droplets,
  Wind,
  ShieldAlert,
  Zap,
  ChevronRight,
  Sun,
  ScanEye,
  TrendingUp,
  CloudRain,
  ListChecks,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { useLoc } from "@/lib/i18nText";
import { fetchWeather, type ApiWeather } from "@/lib/api";
import HealthGauge from "@/components/HealthGauge";

export default function DashboardPage() {
  const router = useRouter();
  const t = useTranslations("dashboard");
  const cropT = useTranslations("crop");
  const statusT = useTranslations("status");
  const fcT = useTranslations("forecast");
  const recT = useTranslations("recommendations");
  const loc = useLoc();
  const { zones, alerts, prefs, setSelectedZone } = useApp();

  const [liveWeather, setLiveWeather] = useState<ApiWeather | null>(null);

  useEffect(() => {
    fetchWeather().then(setLiveWeather).catch(() => {});
  }, []);

  const avgHealth = zones.length
    ? Math.round(zones.reduce((s, z) => s + z.healthScore, 0) / zones.length)
    : 0;
  const dangerAlerts = alerts.filter((a) => a.severity !== "routine").length;

  return (
    <div className="flex flex-col bg-cream pb-24">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-100 bg-white px-5 py-4">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            {t("greeting")}
          </span>
          <h2 className="text-lg font-bold text-neutral-800">{prefs.farmName}</h2>
        </div>
        <button
          onClick={() => router.push("/notifications")}
          className="relative rounded-xl bg-cream p-2 text-neutral-600 transition-all hover:bg-neutral-200/60"
        >
          <ShieldAlert className="h-5 w-5" />
          {dangerAlerts > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 animate-pulse rounded-full border border-white bg-rose-500" />
          )}
        </button>
      </header>

      <div className="space-y-4 p-4">
        {/* Health index */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/50 bg-white p-5 shadow-sm">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-brand/20 to-transparent opacity-60" />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                {t("healthIndex")}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-neutral-800">{avgHealth}%</span>
                <span className="flex items-center rounded-md bg-brand/10 px-1.5 py-0.5 text-xs font-semibold text-brand">
                  <TrendingUp className="mr-0.5 h-3 w-3" /> +1.2%
                </span>
              </div>
              <p className="max-w-[180px] text-[11px] text-neutral-500">{t("healthHint")}</p>
            </div>
            <HealthGauge value={avgHealth} label={t("stable")} sublabel={t("secure")} />
          </div>
        </div>

        {/* Weather + Spray window */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200/50 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                {t("weather")}
              </span>
              <div className="flex items-center gap-1">
                {liveWeather && (
                  <span className="rounded-full bg-brand/10 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase text-brand">
                    live
                  </span>
                )}
                <Sun className="animate-spin-slow h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div className="mt-2.5">
              {liveWeather ? (
                <>
                  <span className="text-2xl font-bold text-neutral-800">{liveWeather.temp}°C</span>
                  <p className="text-[11px] capitalize text-neutral-500">{loc(liveWeather.conditions)}</p>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold text-neutral-800">--°C</span>
                  <p className="text-[11px] capitalize text-neutral-500">Live weather unavailable</p>
                </>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1 border-t border-neutral-100 pt-2.5 text-[10px] text-neutral-500">
              <span className="flex items-center gap-1">
                <Droplets className="h-3 w-3 text-brand" /> {liveWeather ? `${liveWeather.humidity}%` : "--"}
              </span>
              <span className="flex items-center gap-1">
                <Wind className="h-3 w-3 text-brand" /> {liveWeather ? `${liveWeather.windSpeed} m/s` : "--"}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-3xl border border-slate-200/50 bg-cream p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand">
                {t("sprayWindow")}
              </span>
              <div className="rounded-lg bg-brand/10 p-1.5 text-brand">
                <Zap className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-800">{t("sprayOptimal")}</p>
              <p className="mt-1 text-[10px] text-neutral-500">{t("sprayHint")}</p>
            </div>
            <button
              onClick={() => router.push("/recommendations")}
              className="mt-2 flex items-center justify-between text-[11px] font-bold text-brand hover:underline"
            >
              <span>{t("viewInstructions")}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Scan CTA */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand to-brand-dark p-4 text-white shadow-xl">
          <div className="absolute bottom-0 right-0 translate-x-4 translate-y-4 opacity-10">
            <ScanEye className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider">
              {t("scanBadge")}
            </span>
            <h3 className="mt-1.5 text-sm font-bold">{t("scanTitle")}</h3>
            <p className="mt-1 max-w-[230px] text-xs leading-relaxed text-white/85">{t("scanDesc")}</p>
            <button
              onClick={() => router.push("/scan")}
              className="mt-3.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-brand-dark shadow-sm transition-all hover:bg-cream active:scale-95"
            >
              {t("scanNow")}
            </button>
          </div>
        </div>

        {/* Quick access: Forecast & Recommendations */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push("/forecast")}
            className="flex items-center gap-2.5 rounded-3xl border border-slate-200/50 bg-white p-3.5 text-left shadow-sm transition-all hover:bg-cream/40 active:translate-y-0.5"
          >
            <div className="rounded-2xl bg-rose-50 p-2 text-rose-500">
              <CloudRain className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold leading-tight text-neutral-800">{fcT("title")}</span>
          </button>
          <button
            onClick={() => router.push("/recommendations")}
            className="flex items-center gap-2.5 rounded-3xl border border-slate-200/50 bg-white p-3.5 text-left shadow-sm transition-all hover:bg-cream/40 active:translate-y-0.5"
          >
            <div className="rounded-2xl bg-brand/10 p-2 text-brand">
              <ListChecks className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold leading-tight text-neutral-800">{recT("title")}</span>
          </button>
        </div>

        {/* Field sectors */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-400">
              {t("sectors")}
            </h3>
            <button
              onClick={() => router.push("/map")}
              className="flex items-center text-[11px] font-bold text-brand hover:underline"
            >
              <span>{t("viewMap")}</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {zones.length === 0 && (
              <div className="rounded-3xl border border-slate-200/40 bg-white p-5 text-center text-xs text-neutral-400 shadow-sm">
                No live field sectors yet.
              </div>
            )}
            {zones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => {
                  setSelectedZone(zone.id);
                  router.push("/map");
                }}
                className="flex w-full items-center justify-between rounded-3xl border border-slate-200/40 bg-white p-3.5 text-left shadow-sm transition-all hover:bg-cream/40 active:translate-x-0.5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      zone.color === "green"
                        ? "bg-emerald-500"
                        : zone.color === "yellow"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-neutral-800">{loc(zone.name)}</h4>
                      <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[9px] font-medium text-neutral-500">
                        {cropT(zone.crop)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-neutral-500">
                      {zone.sizeHa} га · {statusT(zone.status)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-neutral-800">{zone.healthScore}%</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-300" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent alert */}
        {alerts.length > 0 && (
          <div className="overflow-hidden rounded-3xl border border-amber-200/40 bg-amber-50/75 p-3.5 shadow-sm">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <h4 className="text-xs font-bold text-neutral-800">{t("recentAlert")}</h4>
                <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-600">
                  {loc(alerts[0].message)}
                </p>
                <button
                  onClick={() => router.push("/notifications")}
                  className="mt-2 text-[10px] font-bold text-amber-800 hover:underline"
                >
                  {t("configureDrone")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
