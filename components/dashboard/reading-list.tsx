import Link from "next/link";
import { HexagramDisplay } from "@/components/HexagramDisplay";
import {
  formatChangingLinesBadge,
  parseChangingLines,
} from "@/lib/iching";
import { getHexagram } from "@/lib/hexagrams";
import type { ReadingListItem } from "@/types/reading";

type ReadingListProps = {
  readings: ReadingListItem[];
};

export function ReadingList({ readings }: ReadingListProps) {
  if (readings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-zen-surface/40 px-6 py-12 text-center">
        <p className="text-zen-muted">No readings yet.</p>
        <Link
          href="/reading/new"
          className="mt-4 inline-block text-sm font-medium text-amber-gold transition-colors hover:text-amber-glow"
        >
          Start your first reading →
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {readings.map((reading) => (
        <li key={reading.id}>
          <ReadingListItemCard reading={reading} />
        </li>
      ))}
    </ul>
  );
}

function ReadingListItemCard({ reading }: { reading: ReadingListItem }) {
  const hexagramInfo = getHexagram(reading.hexagram);
  const changingPositions = parseChangingLines(reading.changingLines);
  const changingBadge = formatChangingLinesBadge(changingPositions);
  const date = new Intl.DateTimeFormat("zh-Hant", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(reading.createdAt);

  return (
    <Link
      href={`/reading/${reading.id}`}
      className="group block rounded-xl border border-white/[0.08] bg-zen-elevated/40 p-5 transition-all duration-300 hover:border-amber-gold/35 hover:bg-zen-elevated/70 hover:shadow-[0_0_32px_-12px_rgba(197,160,89,0.3)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-medium text-foreground group-hover:text-amber-glow">
            {reading.question}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-xs text-zen-muted">{date}</p>
            {changingBadge ? (
              <span className="rounded-full border border-cosmic-violet/40 bg-cosmic-purple/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-cosmic-violet">
                動 {changingBadge}
                {reading.transformedHexagram
                  ? ` → ${reading.transformedHexagram}`
                  : null}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <HexagramDisplay hexagramNumber={reading.hexagram} size="sm" />
          <p className="font-serif text-base text-amber-gold">
            {hexagramInfo.chineseName}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-zen-muted">
            #{reading.hexagram}
          </p>
        </div>
      </div>
    </Link>
  );
}
