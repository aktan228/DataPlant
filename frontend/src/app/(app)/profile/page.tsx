"use client";

import { useTranslations } from "next-intl";
import {
  User,
  MapPin,
  Crown,
  Sparkles,
  Battery,
  Plane,
  ArrowUpFromLine,
  Gauge,
  Camera,
  Bell,
  Rocket,
  Languages,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { useLoc } from "@/lib/i18nText";
import ScreenHeader from "@/components/ScreenHeader";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-6 w-11 rounded-full transition-all ${on ? "bg-brand" : "bg-neutral-300"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const c = useTranslations("common");
  const loc = useLoc();
  const { prefs, updatePrefs, drones } = useApp();
  const isPremium = prefs.tier === "premium";

  return (
    <div className="flex flex-col bg-cream pb-24">
      <ScreenHeader kicker={t("kicker")} title={t("title")} />
      <div className="space-y-4 p-4">
        {/* Account */}
        <div className="flex items-center gap-3 rounded-3xl border border-slate-200/50 bg-white p-4 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <User className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-800">{prefs.userName}</h3>
            <p className="text-xs text-neutral-500">{prefs.farmName}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-neutral-400">
              <MapPin className="h-3 w-3" /> {prefs.location}
            </p>
          </div>
        </div>

        {/* Subscription */}
        <div
          className={`overflow-hidden rounded-3xl p-5 shadow-sm ${
            isPremium ? "bg-gradient-to-r from-brand to-brand-dark text-white" : "border border-slate-200/50 bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                isPremium ? "text-white/80" : "text-neutral-400"
              }`}
            >
              {isPremium ? <Crown className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              {t("subscription")}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                isPremium ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
              }`}
            >
              {isPremium ? c("premium") : c("free")}
            </span>
          </div>
          <p className={`mt-2 text-xs ${isPremium ? "text-white/85" : "text-neutral-500"}`}>
            {isPremium ? t("tierPremiumDesc") : t("tierFreeDesc")}
          </p>
          <button
            onClick={() => updatePrefs({ tier: isPremium ? "free" : "premium" })}
            className={`mt-3.5 w-full rounded-xl px-4 py-2.5 text-xs font-bold transition-all active:scale-95 ${
              isPremium ? "bg-white/15 text-white hover:bg-white/25" : "bg-brand text-white hover:bg-brand-dark"
            }`}
          >
            {isPremium ? t("switchToFree") : t("switchToPremium")}
          </button>
        </div>

        {/* Drones */}
        <div>
          <h3 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            {t("drones")}
          </h3>
          <div className="space-y-2">
            {drones.map((d) => (
              <div key={d.id} className="rounded-3xl border border-slate-200/50 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-xl bg-brand/10 p-2 text-brand">
                      <Plane className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-800">{d.name}</h4>
                      <p className="text-[10px] text-neutral-500">{d.model}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-cream px-2 py-1 text-[9px] font-bold text-neutral-600">
                    <Battery className="h-3 w-3" /> {d.battery}%
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3 text-[10px]">
                  <Spec Icon={ArrowUpFromLine} label={t("altitude")} value={`${d.scanAltitudeMeters} м`} />
                  <Spec Icon={Gauge} label={t("speed")} value={`${d.speedMetersPerSec} м/с`} />
                  <Spec
                    Icon={Plane}
                    label={t("lastFlight")}
                    value={loc(d.lastFlight)}
                  />
                </div>
                <p className="mt-2 flex items-center gap-1 text-[9px] text-neutral-400">
                  <Camera className="h-3 w-3" /> {d.cameraType}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-3xl border border-slate-200/50 bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            {t("preferences")}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-medium text-neutral-700">
                <Bell className="h-4 w-4 text-brand" /> {t("notifyHighRisk")}
              </span>
              <Toggle
                on={prefs.notifyOnHighRisk}
                onClick={() => updatePrefs({ notifyOnHighRisk: !prefs.notifyOnHighRisk })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-medium text-neutral-700">
                <Rocket className="h-4 w-4 text-brand" /> {t("droneAutoLaunch")}
              </span>
              <Toggle
                on={prefs.droneAutoLaunch}
                onClick={() => updatePrefs({ droneAutoLaunch: !prefs.droneAutoLaunch })}
              />
            </div>
            <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
              <span className="flex items-center gap-2 text-xs font-medium text-neutral-700">
                <Languages className="h-4 w-4 text-brand" /> {t("language")}
              </span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({
  Icon,
  label,
  value,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="text-center">
      <Icon className="mx-auto mb-1 h-3.5 w-3.5 text-neutral-400" />
      <span className="block font-mono text-[8px] font-bold uppercase text-neutral-400">{label}</span>
      <span className="block text-[10px] font-semibold text-neutral-700">{value}</span>
    </div>
  );
}
