import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminFeedbackLoading() {
  return (
    <AdminShell title="User feedback">
      <div className="space-y-8" aria-busy="true" aria-label="Loading feedback">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-white/10 bg-zen-surface/40"
            />
          ))}
        </div>
        <div className="h-10 animate-pulse rounded-full bg-white/5" />
        <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-zen-surface/30" />
      </div>
    </AdminShell>
  );
}
