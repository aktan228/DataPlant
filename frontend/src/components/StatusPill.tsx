import type { ZoneStatus } from "@/lib/types";

const STYLES: Record<ZoneStatus, string> = {
  healthy: "bg-brand/10 text-brand",
  atRisk: "bg-amber-50 text-amber-700",
  infected: "bg-rose-50 text-rose-700",
};

export default function StatusPill({ status, label }: { status: ZoneStatus; label: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${STYLES[status]}`}>
      {label}
    </span>
  );
}
