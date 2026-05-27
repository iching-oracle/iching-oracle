import { AdminShell } from "@/components/admin/admin-shell";
import { ReadingsChart } from "@/components/admin/readings-chart";
import { getAdminOverviewStats } from "@/lib/admin/stats";

export default async function AdminAnalyticsPage() {
  const stats = await getAdminOverviewStats();

  return (
    <AdminShell title="Analytics">
      <section className="rounded-2xl border border-white/10 bg-zen-surface/40 p-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
          Reading volume (30 days)
        </h2>
        <div className="mt-4">
          <ReadingsChart data={stats.readingsByDay} />
        </div>
      </section>
      <p className="mt-6 text-sm text-zen-muted">
        Product analytics (PostHog / GA) respect cookie consent and appear in those
        tools when configured.
      </p>
    </AdminShell>
  );
}
