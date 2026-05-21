"use client";

import type { ReadingHistoryPeriod } from "@/types/reading-journal";

const PERIODS: Array<{ id: ReadingHistoryPeriod; label: string }> = [
  { id: "all", label: "All" },
  { id: "favorites", label: "Favorites" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
];

type HistoryPeriodTabsProps = {
  period: ReadingHistoryPeriod;
  onChange: (period: ReadingHistoryPeriod) => void;
  onApply: (period: ReadingHistoryPeriod) => void;
};

export function HistoryPeriodTabs({
  period,
  onChange,
  onApply,
}: HistoryPeriodTabsProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Filter readings by time"
    >
      {PERIODS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={period === tab.id}
          onClick={() => {
            onChange(tab.id);
            onApply(tab.id);
          }}
          className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all ${
            period === tab.id
              ? "border-amber-gold/50 bg-amber-gold/15 text-amber-glow shadow-[0_0_20px_-8px_rgba(197,160,89,0.4)]"
              : "border-white/10 text-zen-muted hover:border-amber-gold/30 hover:text-foreground"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
