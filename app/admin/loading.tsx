export default function AdminLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-zen-bg">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-amber-gold/30 border-t-amber-gold"
          aria-hidden
        />
        <p className="text-sm text-zen-muted">Loading admin…</p>
      </div>
    </div>
  );
}
