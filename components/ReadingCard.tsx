import Link from "next/link";
import { formatChangingLinesList } from "@/lib/readings/history";
import { formatDate } from "@/lib/format-date";
import { truncate } from "@/lib/truncate";
import type { ReadingHistoryItem } from "@/types/reading-history";

type ReadingCardProps = {
  reading: ReadingHistoryItem;
  href?: string;
};

export function ReadingCard({ reading, href }: ReadingCardProps) {
  const detailHref = href ?? `/history/${reading.id}`;
  const changingLabel = formatChangingLinesList(reading.changingLines);

  return (
    <article className="group rounded-xl border border-white/[0.08] bg-zen-elevated/40 p-5 transition-all duration-300 hover:border-amber-gold/35 hover:bg-zen-elevated/70 hover:shadow-[0_0_32px_-12px_rgba(197,160,89,0.28)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="line-clamp-2 font-medium leading-snug text-foreground group-hover:text-amber-glow">
            {reading.question}
          </p>

          <dl className="grid gap-1.5 text-sm text-foreground/85">
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-zen-muted">Primary:</dt>
              <dd className="font-medium text-amber-gold">
                #{reading.primaryHexagramNumber} {reading.primaryHexagramName}
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-zen-muted">Changing:</dt>
              <dd>{changingLabel}</dd>
            </div>
            {reading.finalHexagramNumber ? (
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-zen-muted">Final:</dt>
                <dd className="text-cosmic-violet">
                  #{reading.finalHexagramNumber}{" "}
                  {reading.finalHexagramName}
                </dd>
              </div>
            ) : null}
          </dl>

          <p className="text-xs leading-relaxed text-zen-muted">
            {truncate(reading.interpretationSummary, 120)}
          </p>

          <time
            dateTime={reading.createdAt.toISOString()}
            className="block text-xs text-zen-muted"
          >
            {formatDate(reading.createdAt)}
          </time>
        </div>

        <Link
          href={detailHref}
          className="auth-btn-secondary shrink-0 self-start text-center text-xs sm:min-w-[8.5rem]"
        >
          View Reading
        </Link>
      </div>
    </article>
  );
}
