import Link from "next/link";

type JournalEmptyStateProps = {
  filtered?: boolean;
};

export function JournalEmptyState({ filtered = false }: JournalEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-zen-elevated/30 px-8 py-14 text-center">
      <p className="font-serif text-xl text-foreground/90">
        {filtered ? "No readings match your filters" : "Your journal awaits"}
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zen-muted">
        {filtered
          ? "Try adjusting search or filters to find past consultations."
          : "Each consultation you save becomes part of your personal oracle journey — a record of questions, hexagrams, and insight over time."}
      </p>
      {!filtered ? (
        <Link href="/reading/new" className="auth-btn-primary mt-8 inline-block">
          Consult the Oracle
        </Link>
      ) : null}
    </div>
  );
}
