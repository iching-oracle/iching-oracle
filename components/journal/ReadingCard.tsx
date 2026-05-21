"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FavoriteButton } from "@/components/journal/FavoriteButton";
import { formatChangingLinesList } from "@/lib/readings/format";
import { getCategoryLabel } from "@/lib/readings/category";
import { formatDate } from "@/lib/format-date";
import type { JournalReadingItem } from "@/types/reading-journal";

type ReadingCardProps = {
  reading: JournalReadingItem;
  locale?: string;
  index?: number;
};

export function ReadingCard({ reading, locale, index = 0 }: ReadingCardProps) {
  const changingLabel = formatChangingLinesList(reading.changingLines);

  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <article className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-zen-elevated/70 via-zen-surface/50 to-cosmic-deep/20 p-5 backdrop-blur-xl transition-all duration-300 hover:border-amber-gold/35 hover:shadow-[0_0_40px_-12px_rgba(197,160,89,0.35)]">
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-gold/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-0"
          aria-hidden
        />

        <div className="relative flex gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cosmic-violet/30 bg-cosmic-purple/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cosmic-violet">
                {getCategoryLabel(reading.category)}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-zen-muted">
                {reading.interpretationMode}
              </span>
            </div>

            <Link href={`/readings/${reading.id}`} className="block">
              <h3 className="line-clamp-2 font-medium leading-snug text-foreground transition-colors group-hover:text-amber-glow">
                {reading.question}
              </h3>
            </Link>

            <dl className="mt-3 grid gap-1 text-sm text-foreground/85">
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-zen-muted">Primary</dt>
                <dd className="font-medium text-amber-gold">
                  #{reading.primaryHexagramNumber} {reading.primaryHexagramName}
                </dd>
              </div>
              {reading.resultingHexagramNumber ? (
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-zen-muted">Resulting</dt>
                  <dd className="text-cosmic-violet">
                    #{reading.resultingHexagramNumber}{" "}
                    {reading.resultingHexagramName}
                  </dd>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-zen-muted">Changing</dt>
                <dd>{changingLabel}</dd>
              </div>
            </dl>

            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-zen-muted">
              {reading.summary ?? reading.interpretationSummary}
            </p>

            <time
              dateTime={reading.createdAt.toISOString()}
              className="mt-3 block text-xs text-zen-muted"
            >
              {formatDate(reading.createdAt, locale)}
            </time>
          </div>

          <FavoriteButton
            readingId={reading.id}
            initialFavorite={reading.isFavorite}
          />
        </div>
      </article>
    </motion.li>
  );
}
