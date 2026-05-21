"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FavoriteButton } from "@/components/journal/FavoriteButton";
import { getCategoryLabel } from "@/lib/readings/category";
import { formatDate } from "@/lib/format-date";
import type { JournalReadingItem } from "@/types/reading-journal";

type TimelineGroup = {
  key: string;
  label: string;
  readings: JournalReadingItem[];
};

function groupByMonth(readings: JournalReadingItem[]): TimelineGroup[] {
  const map = new Map<string, JournalReadingItem[]>();

  for (const reading of readings) {
    const d = reading.createdAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(d);
    const existing = map.get(key) ?? [];
    existing.push(reading);
    map.set(key, existing);
  }

  return Array.from(map.entries()).map(([key, items]) => ({
    key,
    label: new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(items[0]!.createdAt),
    readings: items,
  }));
}

type ReadingTimelineProps = {
  readings: JournalReadingItem[];
  locale?: string;
};

export function ReadingTimeline({ readings, locale }: ReadingTimelineProps) {
  const groups = groupByMonth(readings);

  return (
    <div className="relative space-y-10 pl-4 sm:pl-6">
      <div
        className="absolute bottom-0 left-[7px] top-0 w-px bg-gradient-to-b from-amber-gold/40 via-cosmic-violet/30 to-transparent sm:left-[11px]"
        aria-hidden
      />

      {groups.map((group, groupIndex) => (
        <motion.section
          key={group.key}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: groupIndex * 0.08 }}
          className="relative"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full border border-amber-gold/50 bg-zen-bg sm:h-5 sm:w-5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-gold" />
            </span>
            <h2 className="font-serif text-lg text-amber-glow">{group.label}</h2>
          </div>

          <ul className="space-y-4 border-l border-transparent pl-6 sm:pl-8">
            {group.readings.map((reading, index) => (
              <motion.li
                key={reading.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-xl border border-white/[0.08] bg-zen-elevated/50 p-4 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-zen-muted">
                      <span className="text-cosmic-violet">
                        {getCategoryLabel(reading.category)}
                      </span>
                      <time dateTime={reading.createdAt.toISOString()}>
                        {formatDate(reading.createdAt, locale)}
                      </time>
                    </div>
                    <Link
                      href={`/readings/${reading.id}`}
                      className="font-medium text-foreground hover:text-amber-glow"
                    >
                      {reading.question}
                    </Link>
                    <p className="mt-2 text-xs text-zen-muted">
                      #{reading.primaryHexagramNumber}
                      {reading.resultingHexagramNumber
                        ? ` → #${reading.resultingHexagramNumber}`
                        : ""}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zen-muted">
                      {reading.summary}
                    </p>
                  </div>
                  <FavoriteButton
                    readingId={reading.id}
                    initialFavorite={reading.isFavorite}
                  />
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.section>
      ))}
    </div>
  );
}
