import Link from "next/link";

type ReflectionStreakWidgetProps = {
  streak: number;
  lastDailyVisit: Date | null;
};

export function ReflectionStreakWidget({
  streak,
  lastDailyVisit,
}: ReflectionStreakWidgetProps) {
  const hasStreak = streak > 0;
  const milestone =
    streak >= 30 ? "A month of presence" : streak >= 7 ? "One week of reflection" : null;

  return (
    <section className="rounded-2xl border border-amber-gold/20 bg-gradient-to-br from-zen-surface/80 to-cosmic-deep/30 p-6 backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-amber-gold/80">
            Reflection rhythm
          </p>
          <p className="mt-2 font-serif text-2xl text-foreground">
            {hasStreak ? (
              <>
                {streak} day{streak === 1 ? "" : "s"} of presence
              </>
            ) : (
              "Begin your rhythm"
            )}
          </p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-zen-muted">
            {hasStreak
              ? milestone ??
                "A gentle streak — not a score, but a sign you are making space to listen."
              : "Visit the daily oracle when you can. Consistency grows quietly over time."}
          </p>
          {lastDailyVisit ? (
            <p className="mt-2 text-xs text-zen-muted/80">
              Last visit:{" "}
              {lastDailyVisit.toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </p>
          ) : null}
        </div>
        <Link
          href="/daily"
          className="auth-btn-primary shrink-0 text-center"
        >
          Today&apos;s oracle
        </Link>
      </div>
    </section>
  );
}
