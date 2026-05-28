"use client";

type DashboardTopbarProps = {
  onOpenMenu: () => void;
};

export function DashboardTopbar({ onOpenMenu }: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/10 bg-zen-bg/80 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-zen-muted lg:hidden"
          aria-label="Open navigation"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <div>
          <h1 className="font-serif text-xl text-foreground sm:text-2xl">
            Product Analytics
          </h1>
          <p className="text-xs text-zen-muted">
            Mock data · PostHog integration coming soon
          </p>
        </div>
      </div>
      <span className="hidden rounded-full border border-amber-gold/30 bg-amber-gold/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-amber-gold sm:inline">
        Preview
      </span>
    </header>
  );
}
