import Link from "next/link";
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
  const date = new Intl.DateTimeFormat("en-US", {
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
          <p className="mt-2 text-xs text-zen-muted">{date}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-serif text-2xl text-amber-gold">{reading.hexagram}</p>
          <p className="text-[10px] uppercase tracking-widest text-zen-muted">
            Hexagram
          </p>
        </div>
      </div>
    </Link>
  );
}
