import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTestWeeklyEmailButton } from "@/components/admin/admin-test-weekly-email-button";
import { StatCard } from "@/components/admin/stat-card";
import { ReadingsChart } from "@/components/admin/readings-chart";
import { getAdminOverviewStats, getAdminSupportTickets } from "@/lib/admin/stats";

export default async function AdminOverviewPage() {
  const [stats, tickets] = await Promise.all([
    getAdminOverviewStats(),
    getAdminSupportTickets(8),
  ]);

  const conversion =
    stats.totalUsers > 0
      ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)
      : "0";

  return (
    <AdminShell title="Overview">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Users" value={stats.totalUsers} />
        <StatCard label="Premium" value={stats.premiumUsers} hint={`${conversion}% conversion`} />
        <StatCard label="Readings (30d)" value={stats.readings30d} />
        <StatCard label="Waitlist" value={stats.waitlistCount} />
        <StatCard label="Open tickets" value={stats.openTickets} />
        <StatCard label="Errors (30d)" value={stats.recentErrors} />
        <StatCard label="AI calls (30d)" value={stats.aiCalls30d} />
        <StatCard label="Credits used (30d)" value={stats.creditsUsed30d} />
      </div>

      <div className="mt-10">
        <AdminTestWeeklyEmailButton />
      </div>

      <section className="mt-10 rounded-2xl border border-white/10 bg-zen-surface/40 p-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
          Readings per day
        </h2>
        <div className="mt-4">
          <ReadingsChart data={stats.readingsByDay} />
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-white/10 p-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
          Top AI features (30d)
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          {stats.topFeatures.map((f) => (
            <li key={f.feature} className="flex justify-between text-zen-muted">
              <span>{f.feature}</span>
              <span>
                {f.count} calls · {f.credits} credits
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
            Recent support
          </h2>
          <Link href="/admin/errors" className="text-xs text-amber-gold hover:underline">
            View errors →
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-white/10">
          {tickets.map((t) => (
            <li key={t.id} className="py-3 text-sm">
              <span className="text-amber-gold/80">{t.category}</span>
              <span className="mx-2 text-zen-muted">·</span>
              <span className="text-foreground">{t.subject}</span>
              <p className="mt-1 text-xs text-zen-muted">{t.email}</p>
            </li>
          ))}
        </ul>
      </section>
    </AdminShell>
  );
}
