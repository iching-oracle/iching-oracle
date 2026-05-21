"use client";

import Link from "next/link";
import { useState } from "react";
import { getHexagram } from "@/lib/hexagrams";
import type { DailyOracleHistoryItem } from "@/types/daily-oracle";

type OracleHistoryTimelineProps = {
  initialHistory: DailyOracleHistoryItem[];
};

export function OracleHistoryTimeline({
  initialHistory,
}: OracleHistoryTimelineProps) {
  const [history, setHistory] = useState(initialHistory);

  async function toggleFavorite(id: string) {
    const res = await fetch(`/api/daily-oracle/${id}/favorite`, {
      method: "PATCH",
    });
    if (!res.ok) return;
    const { isFavorite } = (await res.json()) as { isFavorite: boolean };
    setHistory((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isFavorite } : item,
      ),
    );
  }

  if (history.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-zen-surface/50 px-6 py-10 text-center text-sm text-zen-muted">
        Your daily oracle history will appear here after you visit each day.
      </p>
    );
  }

  return (
    <ol className="relative space-y-6 pl-8">
      <span
        className="absolute bottom-0 left-[7px] top-0 w-px bg-gradient-to-b from-amber-gold/40 via-cosmic-violet/30 to-transparent"
        aria-hidden
      />
      {history.map((item) => {
        const hex = getHexagram(item.hexagramNumber);
        return (
          <li key={item.id} className="relative">
            <span className="absolute -left-8 top-2 flex h-4 w-4 items-center justify-center rounded-full border border-amber-gold/50 bg-zen-bg">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-gold" />
            </span>
            <article className="rounded-2xl border border-white/[0.08] bg-zen-surface/60 p-5 backdrop-blur-xl transition-colors hover:border-amber-gold/30">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <time className="text-xs uppercase tracking-widest text-zen-muted">
                    {item.date}
                  </time>
                  <p className="mt-1 font-serif text-lg text-foreground">
                    {hex.chineseName} · {hex.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFavorite(item.id)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    item.isFavorite
                      ? "border-amber-gold/50 bg-amber-gold/20 text-amber-glow"
                      : "border-white/10 text-zen-muted hover:border-amber-gold/30"
                  }`}
                  aria-label={
                    item.isFavorite ? "Remove favorite" : "Add favorite"
                  }
                >
                  {item.isFavorite ? "★" : "☆"}
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/85 line-clamp-2">
                {item.oracleMessage}
              </p>
              <blockquote className="mt-3 border-l border-amber-gold/30 pl-3 text-sm italic text-zen-muted">
                &ldquo;{item.reflectionQuote}&rdquo;
              </blockquote>
              <p className="mt-2 text-[10px] text-zen-muted">
                Energy {item.energyLevel}%
              </p>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
