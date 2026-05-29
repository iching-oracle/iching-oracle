import Link from "next/link";
import { getDailyOracleHistory } from "@/lib/daily-oracle/service";

type ReflectionTimelineProps = {
  userId: string;
};

export async function ReflectionTimeline({ userId }: ReflectionTimelineProps) {
  const history = await getDailyOracleHistory(userId, 5);
  if (history.length === 0) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-zen-surface/60 p-6 sm:p-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-zen-muted">
            Reflection timeline
          </p>
          <h2 className="mt-1 font-serif text-xl text-foreground">
            Recent daily oracles
          </h2>
        </div>
        <Link
          href="/daily/history"
          className="shrink-0 text-sm text-amber-gold hover:text-amber-glow"
        >
          View all →
        </Link>
      </div>
      <ol className="space-y-4 border-l border-amber-gold/20 pl-4">
        {history.map((entry) => (
          <li key={entry.id} className="relative">
            <span
              className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-amber-gold/40 bg-zen-bg"
              aria-hidden
            />
            <p className="text-xs uppercase tracking-wider text-zen-muted">
              {entry.date}
              {entry.energyLevel != null ? ` · energy ${entry.energyLevel}` : ""}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90 line-clamp-2">
              {entry.oracleMessage}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
