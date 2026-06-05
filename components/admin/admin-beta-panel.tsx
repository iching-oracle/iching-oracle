"use client";

import { useCallback, useEffect, useState } from "react";
import { InviteCodesSection } from "@/components/admin/beta/invite-codes-section";
import type {
  BetaAdminFeedbackRow,
  BetaAdminInviteRow,
  BetaAdminSignupRow,
  BetaInsightsDTO,
} from "@/types/beta";

type WaitlistRow = {
  id: string;
  email: string;
  name: string | null;
  status: string;
  source: string | null;
  waitlistPosition: number | null;
  createdAt: string;
};

export function AdminBetaPanel() {
  const [insights, setInsights] = useState<BetaInsightsDTO | null>(null);
  const [waitlist, setWaitlist] = useState<WaitlistRow[]>([]);
  const [invites, setInvites] = useState<BetaAdminInviteRow[]>([]);
  const [recentSignups, setRecentSignups] = useState<BetaAdminSignupRow[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<BetaAdminFeedbackRow[]>(
    [],
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [overview, wl, inv] = await Promise.all([
      fetch("/api/admin/beta").then((r) => r.json()),
      fetch("/api/admin/beta?view=waitlist").then((r) => r.json()),
      fetch("/api/admin/beta?view=invites").then((r) => r.json()),
    ]);
    setInsights(overview.insights ?? null);
    setRecentSignups(overview.recentSignups ?? []);
    setRecentFeedback(overview.recentFeedback ?? []);
    setWaitlist(wl.waitlist ?? []);
    setInvites(inv.invites ?? []);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function approve(id: string) {
    setBusy(id);
    const res = await fetch("/api/admin/beta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve_waitlist", waitlistId: id }),
    });
    if (res.ok) {
      setMessage("Invite emailed");
      await refresh();
    }
    setBusy(null);
  }

  return (
    <div className="space-y-12">
      {message ? (
        <p className="rounded-lg border border-cosmic-violet/30 bg-cosmic-violet/10 px-4 py-2 text-sm text-cosmic-violet" role="status">
          {message}
        </p>
      ) : null}

      {insights ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Waitlist total" value={insights.totalWaitlist} />
            <Stat label="Pending" value={insights.waitlistPending} />
            <Stat label="Beta members" value={insights.betaMembers} />
            <Stat
              label="Waitlist → joined"
              value={`${insights.waitlistConversionPct}%`}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Invites active" value={insights.inviteCodesActive} />
            <Stat label="Redemptions" value={insights.inviteRedemptions} />
            <Stat label="Feedback (30d)" value={insights.feedbackCount30d} />
            <Stat
              label="Avg rating"
              value={
                insights.avgFeedbackRating != null
                  ? `${insights.avgFeedbackRating}/5`
                  : "—"
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat label="Resonance" value={`${insights.resonanceScore}%`} />
            <Stat label="Beta retention" value={`${insights.betaRetentionPct}%`} />
            <Stat label="Open bugs" value={insights.bugCount} />
          </div>
        </>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-sm uppercase tracking-widest text-zen-muted">
            Recent signups
          </h2>
          <ul className="space-y-2 text-sm">
            {recentSignups.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-white/10 px-4 py-3"
              >
                <span className="truncate text-foreground">{u.email}</span>
                <span className="shrink-0 text-xs text-zen-muted">
                  {u.isBetaMember ? (
                    <span className="text-amber-gold">Beta</span>
                  ) : (
                    "Free"
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-sm uppercase tracking-widest text-zen-muted">
            Recent feedback
          </h2>
          <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
            {recentFeedback.map((f) => (
              <li
                key={f.id}
                className="rounded-lg border border-white/10 px-4 py-3"
              >
                <div className="flex items-center gap-2 text-xs text-zen-muted">
                  <span className="capitalize text-amber-gold/90">{f.type}</span>
                  {f.rating ? <span>{f.rating}/5</span> : null}
                  {f.severity ? <span>{f.severity}</span> : null}
                </div>
                <p className="mt-1 line-clamp-2 text-foreground/85">{f.message}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm uppercase tracking-widest text-zen-muted">
            Waitlist
          </h2>
        </div>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase text-zen-muted">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {waitlist.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="text-foreground">{row.email}</p>
                    {row.name ? (
                      <p className="text-xs text-zen-muted">{row.name}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-xs text-zen-muted">
                    {row.source ?? "—"}
                  </td>
                  <td className="px-4 py-3 capitalize text-zen-muted">
                    {row.status}
                  </td>
                  <td className="px-4 py-3 text-zen-muted">
                    {row.waitlistPosition ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.status === "pending" ? (
                      <button
                        type="button"
                        disabled={busy === row.id}
                        onClick={() => void approve(row.id)}
                        className="text-xs font-medium text-amber-gold hover:underline disabled:opacity-50"
                      >
                        Approve & email
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <InviteCodesSection
        invites={invites}
        busy={busy}
        setBusy={setBusy}
        onRefresh={refresh}
        onMessage={setMessage}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-zen-surface/50 p-4 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-widest text-zen-muted">
        {label}
      </p>
      <p className="mt-1 font-serif text-2xl text-foreground">{value}</p>
    </div>
  );
}
