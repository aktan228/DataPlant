"use client";

import { useLocale } from "next-intl";
import type { Locale } from "./types";

/**
 * Returns a picker that resolves a trilingual value ({ ru, ky, en }) for the
 * active locale, falling back to Russian. Works for strings and string[].
 */
export function useLoc() {
  const locale = useLocale() as Locale;
  return function pick<T extends string | string[]>(value: Record<Locale, T>): T {
    return value[locale] ?? value.ru;
  };
}
