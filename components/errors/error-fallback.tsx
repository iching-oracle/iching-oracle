"use client";

import Link from "next/link";

type ErrorFallbackProps = {
  title?: string;
  message?: string;
  reset?: () => void;
  showHome?: boolean;
};

export function ErrorFallback({
  title = "Something went still",
  message = "The oracle lost the thread for a moment. Your data is safe — please try again.",
  reset,
  showHome = true,
}: ErrorFallbackProps) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold">
        Interruption
      </p>
      <h1 className="mt-3 font-serif text-2xl text-foreground">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-zen-muted">{message}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {reset ? (
          <button type="button" onClick={reset} className="auth-btn-primary text-sm">
            Try again
          </button>
        ) : null}
        {showHome ? (
          <Link
            href="/dashboard"
            className="auth-btn-secondary text-sm"
          >
            Return home
          </Link>
        ) : null}
        <Link href="/support" className="text-sm text-zen-muted hover:text-amber-gold">
          Contact support
        </Link>
      </div>
    </div>
  );
}
