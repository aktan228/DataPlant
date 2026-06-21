"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus, Trash2, ChevronRight, Leaf, CheckCircle2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { useLoc } from "@/lib/i18nText";
import ScreenHeader from "@/components/ScreenHeader";

const CROPS = ["apple", "apricot", "grape", "potato", "tomato"] as const;
const STATUSES = ["healthy", "atRisk", "infected"] as const;

const CROP_EMOJI: Record<string, string> = {
  apple: "🍎", apricot: "🍑", grape: "🍇", potato: "🥔", tomato: "🍅",
};

const STATUS_COLOR: Record<string, string> = {
  healthy: "bg-emerald-100 text-emerald-700",
  atRisk:  "bg-amber-100 text-amber-700",
  infected:"bg-rose-100 text-rose-700",
};

type FormState = {
  name_ru: string; name_ky: string; name_en: string;
  crop: string; size_ha: string; health_score: string;
  status: string; latitude: string; longitude: string;
};

const EMPTY: FormState = {
  name_ru: "", name_ky: "", name_en: "",
  crop: "apple", size_ha: "", health_score: "85",
  status: "healthy", latitude: "42.87", longitude: "74.59",
};

export default function ZonesPage() {
  const router = useRouter();
  const t = useTranslations("zones");
  const cropT = useTranslations("crop");
  const statusT = useTranslations("status");
  const loc = useLoc();
  const { zones, setSelectedZone } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof FormState, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_ru: form.name_ru || form.name_en,
          name_ky: form.name_ky || form.name_en,
          name_en: form.name_en || form.name_ru,
          crop: form.crop,
          size_ha: parseFloat(form.size_ha) || 1,
          health_score: parseInt(form.health_score) || 85,
          status: form.status,
          latitude: parseFloat(form.latitude) || 42.87,
          longitude: parseFloat(form.longitude) || 74.59,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      setSaved(true);
      setForm(EMPTY);
      setShowForm(false);
      setTimeout(() => {
        setSaved(false);
        window.location.reload();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col bg-cream pb-24">
      <ScreenHeader kicker={t("kicker")} title={t("title")} />

      {saved && (
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {t("saved")}
        </div>
      )}

      {/* Add button */}
      {!showForm && (
        <div className="px-4 mb-4">
          <button
            onClick={() => setShowForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3 text-sm font-bold text-white"
          >
            <Plus className="h-4 w-4" /> {t("addZone")}
          </button>
        </div>
      )}

      {/* Add zone form */}
      {showForm && (
        <form onSubmit={submit} className="mx-4 mb-4 rounded-3xl border border-slate-200/60 bg-white p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-neutral-800 mb-2">{t("addZone")}</h3>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t("nameRu")}</label>
            <input
              value={form.name_ru} onChange={e => set("name_ru", e.target.value)}
              placeholder="Сад Северный"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t("nameKy")}</label>
              <input
                value={form.name_ky} onChange={e => set("name_ky", e.target.value)}
                placeholder="Түндүк бак"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t("nameEn")}</label>
              <input
                value={form.name_en} onChange={e => set("name_en", e.target.value)}
                placeholder="North Orchard"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t("crop")}</label>
              <select
                value={form.crop} onChange={e => set("crop", e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand focus:bg-white"
              >
                {CROPS.map(c => (
                  <option key={c} value={c}>{CROP_EMOJI[c]} {cropT(c)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t("sizeHa")}</label>
              <input
                type="number" min="0.1" step="0.1" value={form.size_ha}
                onChange={e => set("size_ha", e.target.value)}
                placeholder="25"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t("health")} (0-100)</label>
              <input
                type="number" min="0" max="100" value={form.health_score}
                onChange={e => set("health_score", e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t("status")}</label>
              <select
                value={form.status} onChange={e => set("status", e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand focus:bg-white"
              >
                {STATUSES.map(s => <option key={s} value={s}>{statusT(s)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t("lat")}</label>
              <input
                type="number" step="0.0001" value={form.latitude}
                onChange={e => set("latitude", e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t("lon")}</label>
              <input
                type="number" step="0.0001" value={form.longitude}
                onChange={e => set("longitude", e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand focus:bg-white"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 rounded-xl bg-rose-50 px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button" onClick={() => { setShowForm(false); setError(null); }}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-neutral-600"
            >
              {t("cancel")}
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 rounded-xl bg-brand py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? t("saving") : t("save")}
            </button>
          </div>
        </form>
      )}

      {/* Existing zones list */}
      <div className="space-y-3 px-4">
        {zones.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Leaf className="h-10 w-10 text-neutral-300 mb-3" />
            <p className="text-sm font-semibold text-neutral-500">{t("empty")}</p>
            <p className="text-xs text-neutral-400 mt-1">{t("emptyHint")}</p>
          </div>
        )}
        {zones.map(zone => (
          <button
            key={zone.id}
            onClick={() => { setSelectedZone(zone.id); router.push("/map"); }}
            className="flex w-full items-center gap-3 rounded-3xl border border-slate-200/50 bg-white p-4 shadow-sm text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-xl">
              {CROP_EMOJI[zone.crop] ?? "🌱"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-neutral-800 truncate">{loc(zone.name)}</p>
              <p className="text-xs text-neutral-500">{cropT(zone.crop)} · {zone.sizeHa} га</p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLOR[zone.status]}`}>
              {statusT(zone.status)}
            </span>
            <ChevronRight className="h-4 w-4 text-neutral-300 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}