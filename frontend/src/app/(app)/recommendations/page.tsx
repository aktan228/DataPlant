"use client";

import { useTranslations } from "next-intl";
import { FlaskConical, Clock, MapPin } from "lucide-react";
import { useApp } from "@/lib/store";
import ScreenHeader from "@/components/ScreenHeader";
import type { Priority } from "@/lib/types";

const PRIO_STYLE: Record<Priority, string> = {
  High: "bg-rose-50 text-rose-700",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-emerald-50 text-emerald-700",
};

export default function RecommendationsPage() {
  const t = useTranslations("recommendations");
  const prioT = useTranslations("priority");
  const { scans } = useApp();
  const actionable = scans.filter((scan) => scan.recommendation);

  return (
    <div className="flex flex-col bg-cream pb-24">
      <ScreenHeader kicker={t("kicker")} title={t("title")} />
      <div className="space-y-3 p-4">
        {actionable.length === 0 && (
          <div className="rounded-3xl border border-slate-200/50 bg-white p-8 text-center text-sm text-neutral-400 shadow-sm">
            No real recommendations yet.
          </div>
        )}
        {actionable.map((scan) => {
          const priority = scan.priority ?? "Medium";
          return (
            <div key={scan.id} className="rounded-3xl border border-slate-200/50 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-brand/10 p-2.5 text-brand">
                    <FlaskConical className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                      Live AI
                    </span>
                    <h3 className="text-sm font-bold leading-tight text-neutral-800">{scan.recommendation}</h3>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${PRIO_STYLE[priority]}`}>
                  {prioT(priority)}
                </span>
              </div>

              {scan.recoDescription && (
                <p className="mt-3 text-[11px] leading-relaxed text-neutral-600">{scan.recoDescription}</p>
              )}

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-neutral-100 pt-3 text-[10px]">
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <Clock className="h-3.5 w-3.5 text-brand" />
                  <span>{scan.recoTiming ?? "-"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <MapPin className="h-3.5 w-3.5 text-brand" />
                  <span>{scan.actionRequired ?? scan.diseaseName}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
