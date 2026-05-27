import Link from "next/link";

export function CtaOracle() {
  return (
    <section className="rounded-2xl border border-amber-gold/25 bg-gradient-to-br from-amber-gold/10 via-zen-surface/60 to-cosmic-purple/10 p-8 text-center">
      <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold">
        Your turn
      </p>
      <h2 className="mt-2 font-serif text-xl text-foreground">
        Ask the oracle your question
      </h2>
      <p className="mt-2 text-sm text-zen-muted">
        Receive a personal hexagram cast and AI interpretation — private, reflective, and yours.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/reading/guided" className="auth-btn-primary text-sm">
          Begin guided reading
        </Link>
        <Link
          href="/reading/new"
          className="rounded-full border border-white/15 px-6 py-3 text-sm text-foreground hover:border-amber-gold/30"
        >
          Quick consult
        </Link>
      </div>
    </section>
  );
}
