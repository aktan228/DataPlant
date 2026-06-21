import type { Metadata, Viewport } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import "./globals.css";
import { AppProvider } from "@/lib/store";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jb",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DataPlant — AI диагностика растений",
  description:
    "AI-платформа для раннего выявления болезней растений в Кыргызстане: диагностика по фото, карта здоровья поля, прогноз и рекомендации.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#2d5a27",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${manrope.variable} ${jetbrains.variable} h-full`}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider>
          <AppProvider>
            <div className="relative mx-auto flex min-h-screen w-full max-w-[460px] flex-col bg-cream shadow-2xl">
              {children}
            </div>
          </AppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
