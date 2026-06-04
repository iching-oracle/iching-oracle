"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { InsightTimelineEntry } from "@/types/insights";
import { formatDateTime } from "@/lib/format-date";

const KIND_LABEL: Record<InsightTimelineEntry["kind"], string> = {
  reading: "Reading",
  milestone: "Milestone",
  memory: "Memory",
  report: "Report",
};

type InsightTimelineProps = {
  entries: InsightTimelineEntry[];
  blurred?: boolean;
};

export function InsightTimeline({ entries, blurred = false }: InsightTimelineProps) {
  if (entries.length === 0) return null;

  return (
    <section
      className={blurred ? "pointer-events-none select-none blur-md" : ""}
      aria-label="Insight timeline"
    >
      <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-zen-muted">
        Journey timeline
      </h2>
      <ol className="relative space-y-0 border-l border-amber-gold/20 pl-6">
        {entries.map((entry, i) => (
          <motion.li
            key={`${entry.kind}-${entry.id}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.03 * i }}
            className="relative pb-8 last:pb-0"
          >
            <span
              className="absolute -left-[1.65rem] top-1.5 h-2.5 w-2.5 rounded-full border border-amber-gold/60 bg-zen-bg"
              aria-hidden
            />
            <p className="text-[10px] uppercase tracking-widest text-cosmic-violet">
              {KIND_LABEL[entry.kind]}
              <span className="mx-2 text-zen-muted/50">·</span>
              <time dateTime={entry.createdAt}>
                {formatDateTime(entry.createdAt, "en-US")}
              </time>
            </p>
            {entry.kind === "reading" ? (
              <Link
                href={`/history/${entry.id}`}
                className="mt-1 block font-medium text-foreground/90 hover:text-amber-gold"
              >
                {entry.title}
              </Link>
            ) : (
              <p className="mt-1 font-medium text-foreground/90">{entry.title}</p>
            )}
            {entry.subtitle ? (
              <p className="mt-1 text-sm text-zen-muted">{entry.subtitle}</p>
            ) : null}
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
