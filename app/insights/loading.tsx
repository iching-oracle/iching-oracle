export default function InsightsLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-8 px-6 py-16 sm:px-10">
      <div className="h-8 w-48 rounded bg-white/10" />
      <div className="h-4 w-full max-w-xl rounded bg-white/5" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-white/5" />
        ))}
      </div>
      <div className="h-64 rounded-3xl bg-white/5" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-56 rounded-2xl bg-white/5" />
        <div className="h-56 rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}
