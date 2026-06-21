"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Lock, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";

export default function PremiumGate({ children }: { children: ReactNode }) {
  const { prefs, updatePrefs } = useApp();
  const t = useTranslations("premium");

  if (prefs.tier === "premium") return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-50 blur-[3px]">{children}</div>
      <div className="absolute inset-0 flex items-start justify-center px-6 pt-16">
        <div className="w-full max-w-xs rounded-3xl border border-brand/15 bg-white p-5 text-center shadow-xl">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-800">{t("lockedTitle")}</h3>
          <p className="mx-auto mt-1 max-w-[220px] text-[11px] leading-relaxed text-neutral-500">
            {t("lockedDesc")}
          </p>
          <button
            onClick={() => updatePrefs({ tier: "premium" })}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-brand-dark active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("upgradeCta")}
          </button>
        </div>
      </div>
    </div>
  );
}
