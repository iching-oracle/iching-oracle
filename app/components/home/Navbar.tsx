import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-zen-bg/80 backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10 lg:px-12"
        aria-label="Main"
      >
        <Link
          href="/"
          className="group flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-gold/20 bg-zen-surface/80 text-lg text-amber-gold shadow-[0_0_20px_-8px_rgba(197,160,89,0.5)] transition-shadow duration-300 group-hover:shadow-[0_0_28px_-6px_rgba(197,160,89,0.65)]"
            aria-hidden
          >
            ☰
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.28em] text-foreground/90 sm:text-sm">
            ICHING-ORACLE
          </span>
        </Link>

        <Link
          href="#methods"
          className="hidden text-xs font-medium uppercase tracking-[0.2em] text-zen-muted transition-colors hover:text-amber-gold sm:inline"
        >
          Methods
        </Link>
      </nav>
    </header>
  );
}
