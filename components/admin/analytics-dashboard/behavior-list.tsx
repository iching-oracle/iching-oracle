"use client";

import type { BehaviorRow } from "@/lib/admin/mock-analytics-data";

export function BehaviorList({
  title,
  rows,
  suffix = "",
}: {
  title: string;
  rows: BehaviorRow[];
  suffix?: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-zen-surface/50 p-5 backdrop-blur-xl">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.label}>
            <div className="flex justify-between text-xs">
              <span className="truncate pr-3 text-zen-muted">{row.label}</span>
              <span className="shrink-0 text-foreground">
                {row.value.toLocaleString()}
                {suffix}
                {row.change !== undefined ? (
                  <span
                    className={
                      row.change >= 0 ? "text-emerald-400" : "text-red-400"
                    }
                  >
                    {" "}
                    {row.change >= 0 ? "+" : ""}
                    {row.change}%
                  </span>
                ) : null}
              </span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-gold/80 to-violet-500/80"
                style={{ width: `${(row.value / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
