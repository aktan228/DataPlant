"use client";

import { useTranslations } from "next-intl";
import { Activity, CheckCircle2 } from "lucide-react";
import { useApp } from "@/lib/store";
import ScreenHeader from "@/components/ScreenHeader";
import PremiumGate from "@/components/PremiumGate";

export default function HistoryPage() {
  const t = useTranslations("history");
  const { scans } = useApp();

  return (
    <div className="flex flex-col bg-cream pb-24">
      <ScreenHeader kicker={t("kicker")} title={t("title")} />
      <PremiumGate>
        <div className="space-y-4 p-4">
          <div>
            <h3 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              {t("outbreakLog")}
            </h3>
            <div className="space-y-2">
              {scans.length === 0 && (
                <div className="rounded-3xl border border-slate-200/50 bg-white p-8 text-center text-sm text-neutral-400 shadow-sm">
                  No real scans yet.
                </div>
              )}
              {scans.map((scan) => (
                <div key={scan.id} className="rounded-2xl border border-slate-200/40 bg-white p-3.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800">{scan.diseaseName}</span>
                    <span className="flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[9px] font-bold text-brand">
                      <Activity className="h-3 w-3" /> {scan.confidence}%
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-neutral-500">
                    <span>{new Date(scan.createdAt).toLocaleString()}</span>
                    <span>{scan.crop}</span>
                    <span>{scan.severity}</span>
                    {scan.synced && (
                      <span className="flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Live AI
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PremiumGate>
    </div>
  );
}
