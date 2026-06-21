"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Sprout, ShieldAlert, Map as MapIcon, WifiOff, ArrowRight, Activity } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const c = useTranslations("common");

  const features = [
    { Icon: ShieldAlert, color: "bg-brand/10 text-brand", title: t("f1Title"), desc: t("f1Desc") },
    { Icon: MapIcon, color: "bg-amber-50 text-amber-600", title: t("f2Title"), desc: t("f2Desc") },
    { Icon: WifiOff, color: "bg-sky-50 text-sky-600", title: t("f3Title"), desc: t("f3Desc") },
  ];

  return (
    <div className="flex min-h-screen flex-col justify-between bg-cream p-6">
      <div className="flex items-center justify-between pt-6">
        <div className="flex items-center gap-2 rounded-full border border-neutral-200/50 bg-white px-3.5 py-2 shadow-sm">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            {t("version")}
          </span>
        </div>
        <LanguageSwitcher />
      </div>

      <div className="my-auto flex flex-col items-center px-2 text-center">
        <div className="relative mb-5">
          <div className="absolute inset-0 scale-110 rounded-full bg-brand/10 opacity-60 blur-xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-cream-border bg-white shadow-md">
            <Sprout className="h-12 w-12 text-brand" strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-2 -right-2 flex items-center gap-0.5 rounded-md bg-brand px-2 py-1 text-[10px] font-bold text-white shadow-lg">
            <Activity className="h-3 w-3 animate-pulse" />
            <span>AI</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-neutral-800">
          Data<span className="text-brand">Plant</span>
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-500">{t("tagline")}</p>

        <div className="mt-8 w-full max-w-xs space-y-3 text-left">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3 rounded-2xl border border-cream-border/60 bg-white p-3 shadow-sm"
            >
              <div className={`rounded-xl p-1.5 ${f.color}`}>
                <f.Icon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-neutral-800">{f.title}</h4>
                <p className="text-[11px] text-neutral-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pb-4">
        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-4 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-dark active:scale-[0.98]"
        >
          <span>{c("getStarted")}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-4 text-center text-[10px] tracking-wide text-neutral-400">{t("footer")}</p>
      </div>
    </div>
  );
}
