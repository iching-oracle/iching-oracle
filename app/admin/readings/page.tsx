import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminRecentReadings } from "@/lib/admin/stats";
import { formatDateTime } from "@/lib/format-date";

export default async function AdminReadingsPage() {
  const readings = await getAdminRecentReadings();

  return (
    <AdminShell title="Readings">
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 bg-zen-surface/60 text-xs uppercase tracking-widest text-zen-muted">
            <tr>
              <th className="px-4 py-3">Question</th>
              <th className="px-4 py-3">Hex</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {readings.map((r) => (
              <tr key={r.id}>
                <td className="max-w-xs truncate px-4 py-3 text-foreground">
                  {r.question}
                </td>
                <td className="px-4 py-3 text-zen-muted">{r.hexagram}</td>
                <td className="px-4 py-3 text-zen-muted">{r.user.email}</td>
                <td className="px-4 py-3 text-xs text-zen-muted">
                  {r.interpretationPending ? "pending" : "ok"}
                  {r.isPremiumReading ? " · premium" : ""}
                </td>
                <td className="px-4 py-3 text-zen-muted">
                  {formatDateTime(r.createdAt, "en-US")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
