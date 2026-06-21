"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Bell, Info, CheckCheck, MapPin } from "lucide-react";
import { useApp } from "@/lib/store";
import { useLoc } from "@/lib/i18nText";
import ScreenHeader from "@/components/ScreenHeader";
import type { NotificationAlert } from "@/lib/types";

const SEV = {
  highRisk: { Icon: AlertTriangle, box: "bg-rose-50 border-rose-200", icon: "text-rose-600" },
  warning: { Icon: Bell, box: "bg-amber-50 border-amber-200", icon: "text-amber-600" },
  routine: { Icon: Info, box: "bg-white border-slate-200/50", icon: "text-brand" },
} as const;

export default function NotificationsPage() {
  const t = useTranslations("notifications");
  const loc = useLoc();
  const { alerts, markAllAlertsRead, toggleAlertRead } = useApp();
  const unread = alerts.filter((a) => a.unread).length;

  return (
    <div className="flex flex-col bg-cream pb-24">
      <ScreenHeader
        kicker={t("kicker")}
        title={t("title")}
        right={
          unread > 0 ? (
            <button
              onClick={markAllAlertsRead}
              className="flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1.5 text-[10px] font-bold text-brand"
            >
              <CheckCheck className="h-3.5 w-3.5" /> {t("markAllRead")}
            </button>
          ) : undefined
        }
      />
      <div className="space-y-3 p-4">
        {unread > 0 && (
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            {unread} {t("unread")}
          </p>
        )}
        {alerts.length === 0 && (
          <p className="py-10 text-center text-sm text-neutral-400">{t("noAlerts")}</p>
        )}
        {alerts.map((a: NotificationAlert) => {
          const s = SEV[a.severity];
          return (
            <button
              key={a.id}
              onClick={() => toggleAlertRead(a.id)}
              className={`flex w-full items-start gap-3 rounded-3xl border p-4 text-left shadow-sm transition-all ${s.box} ${
                a.unread ? "" : "opacity-65"
              }`}
            >
              <div className={`mt-0.5 shrink-0 ${s.icon}`}>
                <s.Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-800">{loc(a.title)}</h3>
                  {a.unread && <span className="h-2 w-2 rounded-full bg-brand" />}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-neutral-600">{loc(a.message)}</p>
                <div className="mt-2 flex items-center gap-3 text-[10px] text-neutral-400">
                  {a.zone && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {loc(a.zone)}
                    </span>
                  )}
                  <span>{loc(a.time)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
