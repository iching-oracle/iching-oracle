import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin/guard";
import { getWeeklyEmailStats } from "@/lib/admin/stats";

export const metadata = {
  title: "Weekly Emails | Admin",
  robots: { index: false, follow: false },
};

export const revalidate = 300;

export default async function AdminWeeklyEmailsPage() {
  await requireAdminSession();
  const stats = await getWeeklyEmailStats();

  return (
    <AdminShell title="Weekly Emails">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-zen-surface/60 p-6">
          <p className="text-sm text-zen-muted">Weekly Emails Sent</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            {stats.totalSent}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zen-surface/60 p-6">
          <p className="text-sm text-zen-muted">Open Rate</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            {stats.openRate}%
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zen-surface/60 p-6">
          <p className="text-sm text-zen-muted">Click Rate</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            {stats.clickRate}%
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zen-surface/60 p-6">
          <p className="text-sm text-zen-muted">Total Clicks</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            {stats.totalClicked}
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
