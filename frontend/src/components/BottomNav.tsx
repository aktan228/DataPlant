"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Sprout, Map as MapIcon, ScanEye, CalendarRange, Settings } from "lucide-react";

type Tab = {
  href: string;
  key: string;
  Icon: ComponentType<{ className?: string }>;
  center?: boolean;
};

const TABS: Tab[] = [
  { href: "/dashboard", key: "home", Icon: Sprout },
  { href: "/map", key: "map", Icon: MapIcon },
  { href: "/scan", key: "scan", Icon: ScanEye, center: true },
  { href: "/history", key: "ledger", Icon: CalendarRange },
  { href: "/profile", key: "settings", Icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 flex h-20 w-full max-w-[460px] -translate-x-1/2 items-center justify-between border-t border-neutral-100 bg-white/95 px-4 pb-6 pt-2.5 backdrop-blur-md">
      {TABS.map(({ href, key, Icon, center }) => {
        const active = pathname.startsWith(href);
        if (center) {
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center text-brand"
            >
              <span className="relative -top-3 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-brand text-white shadow-md transition-transform active:scale-95">
                <Icon className="h-5 w-5" />
              </span>
              <span className="relative -top-2 text-[9px] font-semibold">{t(key)}</span>
            </Link>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center transition-all ${
              active ? "text-brand" : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="mt-1 text-[9px] font-semibold">{t(key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
