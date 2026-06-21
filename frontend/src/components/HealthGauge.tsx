export default function HealthGauge({
  value,
  label,
  sublabel,
}: {
  value: number;
  label: string;
  sublabel: string;
}) {
  const r = 34;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (circumference * value) / 100;

  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <svg className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={r} className="stroke-neutral-100" strokeWidth="5" fill="transparent" />
        <circle
          cx="40"
          cy="40"
          r={r}
          className="stroke-brand"
          strokeWidth="5"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xs font-bold text-neutral-700">{label}</span>
        <span className="font-mono text-[9px] font-semibold tracking-wider text-brand">{sublabel}</span>
      </div>
    </div>
  );
}
