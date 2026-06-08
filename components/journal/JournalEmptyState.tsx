import Link from "next/link";
import { EMPTY } from "@/lib/atmosphere/copy";

type JournalEmptyStateProps = {
  filtered?: boolean;
};

export function JournalEmptyState({ filtered = false }: JournalEmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/12 bg-zen-elevated/25 px-8 py-14 text-center">
      <div
        className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 h-px w-12 bg-gradient-to-r from-transparent via-amber-gold/30 to-transparent"
        aria-hidden
      />
      <p className="relative font-serif text-xl text-foreground/90">
        {filtered ? EMPTY.journal.filteredTitle : EMPTY.journal.title}
      </p>
      <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-zen-muted">
        {filtered ? EMPTY.journal.filteredBody : EMPTY.journal.body}
      </p>
      {!filtered ? (
        <Link href="/reading/guided" className="auth-btn-primary relative mt-8 inline-block">
          {EMPTY.journal.cta}
        </Link>
      ) : null}
    </div>
  );
}
