import Link from "next/link";
import { CONTINUITY } from "@/lib/atmosphere/copy";

type ContinueJourneyPromptProps = {
  daysSinceLastReading: number | null;
  hasReadings: boolean;
  readingCount?: number;
};

export function ContinueJourneyPrompt({
  daysSinceLastReading,
  hasReadings,
  readingCount = 0,
}: ContinueJourneyPromptProps) {
  if (!hasReadings) {
    return (
      <section className="rounded-2xl border border-white/[0.08] bg-zen-surface/40 p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-zen-muted">
          Your path
        </p>
        <h2 className="mt-2 font-serif text-xl text-foreground/95">
          {CONTINUITY.firstVisit}
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-zen-muted">
          When something weighs on your heart, bring it here. Each reading becomes
          part of your reflective journal.
        </p>
        <Link href="/reading/guided" className="auth-btn-primary mt-5 inline-block">
          Begin a reading
        </Link>
      </section>
    );
  }

  if (daysSinceLastReading != null && daysSinceLastReading >= 3) {
    const continuityNote =
      readingCount >= 5
        ? CONTINUITY.familiarTheme
        : daysSinceLastReading >= 7
          ? CONTINUITY.returning
          : null;

    return (
      <section className="rounded-2xl border border-white/[0.08] bg-zen-surface/40 p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-zen-muted">
          Returning
        </p>
        <h2 className="mt-2 font-serif text-xl text-foreground/95">
          {daysSinceLastReading >= 7
            ? "When you are ready, the oracle listens"
            : "A moment of reflection may help"}
        </h2>
        {continuityNote ? (
          <p className="mt-2 text-sm italic text-amber-gold/80">{continuityNote}</p>
        ) : null}
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
