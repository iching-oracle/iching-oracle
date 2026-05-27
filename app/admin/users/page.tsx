import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminUsers } from "@/lib/admin/stats";
import { formatDateTime } from "@/lib/format-date";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <AdminShell title="Users">
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-white/10 bg-zen-surface/60 text-xs uppercase tracking-widest text-zen-muted">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Credits</th>
              <th className="px-4 py-3">Readings</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.map((u) => (
              <tr key={u.id} className="text-zen-muted">
                <td className="px-4 py-3 text-foreground">
                  {u.email}
                  {u.role === "ADMIN" ? (
                    <span className="ml-2 text-[10px] text-amber-gold">ADMIN</span>
                  ) : null}
                </td>
                <td className="px-4 py-3">{u.subscriptionStatus}</td>
                <td className="px-4 py-3">{u.credits}</td>
                <td className="px-4 py-3">{u._count.readings}</td>
                <td className="px-4 py-3">
                  {formatDateTime(u.createdAt, "en-US")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
