import Link from "next/link";

type ContinueJourneyPromptProps = {
  daysSinceLastReading: number | null;
  hasReadings: boolean;
};

export function ContinueJourneyPrompt({
  daysSinceLastReading,
  hasReadings,
}: ContinueJourneyPromptProps) {
  if (!hasReadings) {
    return (
      <section className="rounded-2xl border border-cosmic-violet/25 bg-cosmic-purple/10 p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-cosmic-violet">
          Your journey
        </p>
        <h2 className="mt-2 font-serif text-xl text-foreground">
          The oracle awaits your first question
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-zen-muted">
          When something weighs on your heart, bring it here. The reading you
          create becomes part of your reflection path.
        </p>
        <Link href="/reading/guided" className="auth-btn-primary mt-5 inline-block">
          Begin guided reading
        </Link>
      </section>
    );
  }

  if (daysSinceLastReading != null && daysSinceLastReading >= 3) {
    return (
      <section className="rounded-2xl border border-white/10 bg-zen-surface/60 p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-zen-muted">
          Continue your journey
        </p>
        <h2 className="mt-2 font-serif text-xl text-foreground">
          {daysSinceLastReading >= 7
            ? "When you are ready, the oracle listens"
            : "A moment of reflection may help"}
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-zen-muted">
          It has been a few days since your last reading. There is no need to
          catch up — only to return when the moment feels right.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/daily" className="auth-btn-secondary">
            Daily oracle
          </Link>
          <Link href="/reading/guided" className="auth-btn-primary">
            New reading
          </Link>
        </div>
      </section>
    );
  }

  return null;
}
