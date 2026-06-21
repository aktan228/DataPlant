import type { ReactNode } from "react";

export default function ScreenHeader({
  kicker,
  title,
  right,
}: {
  kicker?: string;
  title: string;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-100 bg-white px-5 py-4">
      <div>
        {kicker && (
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            {kicker}
          </span>
        )}
        <h2 className="text-lg font-bold text-neutral-800">{title}</h2>
      </div>
      {right}
    </header>
  );
}
