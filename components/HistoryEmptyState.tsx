import Link from "next/link";
import { EMPTY } from "@/lib/atmosphere/copy";

export function HistoryEmptyState() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/12 bg-zen-surface/30 px-8 py-16 text-center">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.08),transparent_65%)]"
        aria-hidden
      />
      <h2 className="relative font-serif text-xl text-foreground/95">
        {EMPTY.history.title}
      </h2>
      <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-zen-muted">
        {EMPTY.history.body}
      </p>
      <Link href="/reading/guided" className="auth-btn-primary relative mt-8 inline-flex">
        {EMPTY.history.cta}
      </Link>
    </div>
  );
}
