import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold">
        Not found
      </p>
      <h1 className="mt-3 font-serif text-2xl text-foreground">Path not found</h1>
      <p className="mt-3 text-sm leading-relaxed text-zen-muted">
        This page does not exist or may have been moved. Return to the oracle or your
        dashboard.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="auth-btn-primary text-sm">
          Home
        </Link>
        <Link href="/dashboard" className="auth-btn-secondary text-sm">
          Dashboard
        </Link>
        <Link
          href="/reading/guided"
          className="text-sm text-zen-muted hover:text-amber-gold"
        >
          Start a reading
        </Link>
      </div>
    </div>
  );
}
