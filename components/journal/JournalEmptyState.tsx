import Link from "next/link";

type JournalEmptyStateProps = {
  filtered?: boolean;
};

export function JournalEmptyState({ filtered = false }: JournalEmptyStateProps) {
  return (
    <div className="relative rounded-2xl border border-dashed border-white/15 bg-zen-elevated/30 px-8 py-14 text-center overflow-hidden">
      <div
        className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 text-4xl text-amber-gold/30"
        aria-hidden
      >
        ✦
      </div>
      <p className="relative font-serif text-xl text-foreground/90">
        {filtered ? "No readings match your filters" : "Your oracle journal awaits"}
      </p>
      <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-zen-muted">
        {filtered
          ? "Try adjusting search or filters to find past consultations."
          : "Each divination you save becomes a chapter in your spiritual journal — questions, hexagrams, and insight preserved in time."}
      </p>
      {!filtered ? (
        <Link href="/reading/new" className="auth-btn-primary relative mt-8 inline-block">
          Cast your first hexagram
        </Link>
      ) : null}
    </div>
  );
}
