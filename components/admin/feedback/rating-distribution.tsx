import type { RatingBucket } from "@/types/admin-feedback";

type RatingDistributionProps = {
  buckets: RatingBucket[];
};

export function RatingDistribution({ buckets }: RatingDistributionProps) {
  const max = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <section
      className="rounded-2xl border border-white/10 bg-zen-surface/40 p-5 sm:p-6"
      aria-label="Rating distribution"
    >
      <h2 className="text-[10px] font-medium uppercase tracking-[0.28em] text-zen-muted">
        Rating distribution
      </h2>
      <ul className="mt-5 flex items-end gap-2 sm:gap-3">
        {buckets.map((bucket) => {
          const height = Math.round((bucket.count / max) * 100);
          return (
            <li
              key={bucket.rating}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <span className="text-[10px] tabular-nums text-zen-muted">
                {bucket.count}
              </span>
              <div
                className="flex w-full max-w-[2.5rem] items-end justify-center"
                style={{ height: "4.5rem" }}
              >
                <div
                  className="w-full max-w-[1.75rem] rounded-t-md bg-gradient-to-t from-amber-gold/80 to-amber-gold/30 transition-all"
                  style={{ height: `${Math.max(4, height)}%` }}
                  role="presentation"
                />
              </div>
              <span className="text-xs font-medium text-foreground/90">
                {bucket.rating}★
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
