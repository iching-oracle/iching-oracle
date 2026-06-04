import type { RecentSignupRow } from "@/lib/admin/recent-signups";

type Props = {
  signups: RecentSignupRow[];
};

export function RecentSignupsTable({ signups }: Props) {
  if (signups.length === 0) {
    return (
      <p className="text-sm text-zen-muted">No signups yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-zen-surface/40">
      <table className="w-full min-w-[320px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-zen-muted">
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Joined</th>
            <th className="px-4 py-3 font-medium">Plan</th>
          </tr>
        </thead>
        <tbody>
          {signups.map((u) => (
            <tr
              key={u.id}
              className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
            >
              <td className="px-4 py-3">
                <p className="font-medium text-foreground">
                  {u.name ?? "—"}
                </p>
                <p className="text-xs text-zen-muted">{u.email}</p>
              </td>
              <td className="px-4 py-3 text-zen-muted">
                {u.createdAt.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
              <td className="px-4 py-3">
                {u.isPremium ? (
                  <span className="rounded-full bg-amber-gold/15 px-2 py-0.5 text-xs text-amber-gold">
                    Premium
                  </span>
                ) : (
                  <span className="text-xs text-zen-muted">Free</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
