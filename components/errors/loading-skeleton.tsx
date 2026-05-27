export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-white/10 bg-zen-surface/50 ${className}`}
      aria-hidden
    >
      <div className="h-4 w-1/3 rounded bg-white/10 m-6" />
      <div className="mx-6 mb-6 space-y-3">
        <div className="h-3 w-full rounded bg-white/8" />
        <div className="h-3 w-5/6 rounded bg-white/8" />
        <div className="h-3 w-4/6 rounded bg-white/8" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12" aria-busy aria-label="Loading">
      <div className="h-8 w-2/3 animate-pulse rounded bg-white/10" />
      <div className="h-4 w-full animate-pulse rounded bg-white/8" />
      <CardSkeleton className="h-48" />
      <CardSkeleton className="h-32" />
    </div>
  );
}
