export function ReadingCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/[0.06] bg-zen-elevated/40 p-5">
      <div className="mb-3 h-4 w-20 rounded bg-white/10" />
      <div className="mb-2 h-5 w-3/4 rounded bg-white/10" />
      <div className="mb-4 h-3 w-full rounded bg-white/5" />
      <div className="h-3 w-1/2 rounded bg-white/5" />
    </div>
  );
}

export function ReadingJournalSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <ReadingCardSkeleton key={i} />
      ))}
    </div>
  );
}
