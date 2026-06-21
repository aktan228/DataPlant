"use client";

import { useLocale } from "next-intl";
import { setLocaleCookie } from "@/lib/locale";

const LANGS = [
  { code: "ru", label: "RU" },
  { code: "ky", label: "KY" },
  { code: "en", label: "EN" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();

  return (
    <div className="flex gap-1 rounded-xl border border-neutral-200 bg-neutral-50 p-1">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLocaleCookie(l.code)}
          className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
            locale === l.code ? "bg-brand text-white shadow-xs" : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
