import Link from "next/link";

export function HistoryEmptyState() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/15 bg-zen-surface/40 px-8 py-16 text-center">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.12),transparent_65%)]"
        aria-hidden
      />
      <p className="relative text-3xl" aria-hidden>
        ☯
      </p>
      <h2 className="relative mt-4 font-serif text-xl font-semibold text-foreground">
        Your oracle journey begins with your first question.
      </h2>
      <p className="relative mt-2 text-sm text-zen-muted">
        Each consultation is saved here — hexagrams, changing lines, and AI
        guidance await your return.
      </p>
      <Link
        href="/reading/new"
        className="auth-btn-primary relative mt-8 inline-flex"
      >
        Start New Reading
      </Link>
    </div>
  );
}
