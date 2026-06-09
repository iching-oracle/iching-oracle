import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatCard } from "@/components/admin/stat-card";
import { UsageChart } from "@/components/admin/usage-chart";
import { getAdminUsageStats } from "@/lib/usage-tracking";

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

export default async function AdminUsagePage() {
  const stats = await getAdminUsageStats();

  return (
    <AdminShell title="AI usage & protection">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Generations (24h)"
          value={stats.dailyGenerations}
        />
        <StatCard
          label="Tokens (24h)"
          value={stats.dailyTokens.toLocaleString()}
        />
        <StatCard
          label="Est. cost (24h)"
          value={formatUsd(stats.dailyCostUsd)}
        />
        <StatCard
          label="Est. cost (30d)"
          value={formatUsd(stats.monthlyCostUsd)}
        />
      </div>

      <section className="mt-10 rounded-2xl border border-white/10 bg-zen-surface/40 p-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
          Daily token consumption
        </h2>
        <div className="mt-4">
          <UsageChart data={stats.tokensByDay} />
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-white/10 p-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
          Most active users (30d)
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-zen-muted">
                <th className="pb-3 pr-4 font-medium">User</th>
                <th className="pb-3 pr-4 font-medium">Plan</th>
                <th className="pb-3 pr-4 font-medium">Generations</th>
                <th className="pb-3 pr-4 font-medium">Tokens</th>
                <th className="pb-3 pr-4 font-medium">Credits</th>
                <th className="pb-3 font-medium">Est. cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {stats.topUsers.map((user) => (
                <tr key={user.userId}>
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/users?q=${encodeURIComponent(user.email)}`}
                      className="text-foreground hover:text-amber-gold"
                    >
                      {user.email}
                    </Link>
                    {user.role === "ADMIN" ? (
                      <span className="ml-2 text-[10px] uppercase text-amber-gold">
                        admin
                      </span>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4 text-zen-muted">{user.planType}</td>
                  <td className="py-3 pr-4">{user.generations}</td>
                  <td className="py-3 pr-4">
                    {user.tokens.toLocaleString()}
                  </td>
                  <td className="py-3 pr-4">{user.credits}</td>
                  <td className="py-3">{formatUsd(user.costUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-white/10 p-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
          Suspicious activity (24h)
        </h2>
        {stats.suspiciousEvents.length === 0 ? (
          <p className="mt-4 text-sm text-zen-muted">No abuse events recorded.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/10">
            {stats.suspiciousEvents.map((event) => (
              <li key={event.id} className="py-3 text-sm">
                <p className="text-foreground">{event.message}</p>
                <p className="mt-1 text-xs text-zen-muted">
                  {new Date(event.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
