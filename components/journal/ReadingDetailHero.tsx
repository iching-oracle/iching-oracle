import { getCategoryLabel } from "@/lib/readings/category";
import { formatDateTimeForLanguage } from "@/lib/format-date";
import { formatHexagramInline, getHexagram } from "@/lib/hexagrams";
import { INTERPRETATION_MODES } from "@/lib/interpretation/modes";
import type { JournalReadingItem } from "@/types/reading-journal";

type ReadingDetailHeroProps = {
  journal: JournalReadingItem;
  language: string;
};

export function ReadingDetailHero({ journal, language }: ReadingDetailHeroProps) {
  const primary = getHexagram(journal.primaryHexagramNumber);
  const resulting = journal.resultingHexagramNumber
    ? getHexagram(journal.resultingHexagramNumber)
    : null;
  const modeLabel =
    INTERPRETATION_MODES.find((m) => m.id === journal.interpretationMode)
      ?.label ?? journal.interpretationMode;

  return (
    <header className="relative overflow-hidden rounded-3xl border border-amber-gold/20 bg-gradient-to-br from-zen-surface/95 via-cosmic-deep/40 to-zen-bg/90 p-6 shadow-[0_0_60px_-20px_rgba(197,160,89,0.35)] backdrop-blur-xl sm:p-10">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-cosmic-purple/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-amber-gold/15 blur-3xl"
        aria-hidden
      />

      <div className="relative space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-cosmic-violet/40 bg-cosmic-purple/20 px-3 py-1 text-xs font-medium uppercase tracking-wider text-cosmic-violet">
            {getCategoryLabel(journal.category)}
          </span>
          <span className="rounded-full border border-amber-gold/30 bg-amber-gold/10 px-3 py-1 text-xs text-amber-glow">
            {modeLabel} mode
          </span>
          {journal.isFavorite ? (
            <span className="text-xs text-amber-gold">★ Favorited</span>
          ) : null}
        </div>

        <p className="text-xs font-medium uppercase tracking-[0.28em] text-zen-muted">
          Oracle Journal
        </p>
        <h1 className="font-serif text-2xl font-semibold leading-snug text-foreground sm:text-3xl">
          {journal.question}
        </h1>

        <p className="text-sm text-zen-muted">
          {formatHexagramInline(primary)}
          {resulting ? ` · → ${formatHexagramInline(resulting)}` : null}
        </p>

        <time
          dateTime={journal.createdAt.toISOString()}
          className="block text-xs text-zen-muted"
        >
          {formatDateTimeForLanguage(journal.createdAt, language)}
        </time>
      </div>
    </header>
  );
}
