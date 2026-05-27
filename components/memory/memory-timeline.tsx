"use client";

import { motion } from "framer-motion";
import { MEMORY_TYPE_LABELS } from "@/lib/memory/constants";
import { formatDate } from "@/lib/format-date";
import type { MemoryTimelineEntry } from "@/types/memory";

type MemoryTimelineProps = {
  entries: MemoryTimelineEntry[];
};

const PERIOD_LABELS: Record<MemoryTimelineEntry["period"], string> = {
  recent: "Recent",
  emerging: "Emerging",
  established: "Established",
};

export function MemoryTimeline({ entries }: MemoryTimelineProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-zen-muted">
        Your journey timeline will grow as patterns emerge over time.
      </p>
    );
  }

  return (
    <div className="relative pl-6">
      <div
        className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-amber-gold/50 via-cosmic-violet/30 to-transparent"
        aria-hidden
      />
      <ul className="space-y-6">
        {entries.map((entry, i) => (
          <motion.li
            key={entry.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative"
          >
            <span
              className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border border-amber-gold/50 bg-amber-gold/30 shadow-[0_0_12px_rgba(197,160,89,0.4)]"
              aria-hidden
            />
            <div className="rounded-xl border border-white/10 bg-zen-surface/50 p-4 backdrop-blur-md">
              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-zen-muted">
                <span className="text-amber-gold">
                  {MEMORY_TYPE_LABELS[entry.type]}
                </span>
                <span>·</span>
                <span>{PERIOD_LABELS[entry.period]}</span>
                <span>·</span>
                <span suppressHydrationWarning>
                  {formatDate(entry.createdAt, "en-US")}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {entry.summary}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
