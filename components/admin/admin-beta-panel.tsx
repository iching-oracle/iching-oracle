"use client";

import { useCallback, useEffect, useState } from "react";
import type { BetaInsightsDTO } from "@/types/beta";

type WaitlistRow = {
  id: string;
  email: string;
  name: string | null;
  status: string;
  waitlistPosition: number | null;
  createdAt: string;
};

type InviteRow = {
  id: string;
  code: string;
  email: string | null;
  useCount: number;
  maxUses: number;
  expiresAt: string | null;
  revokedAt: string | null;
};

export function AdminBetaPanel() {
  const [insights, setInsights] = useState<BetaInsightsDTO | null>(null);
  const [waitlist, setWaitlist] = useState<WaitlistRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [overview, wl, inv] = await Promise.all([
      fetch("/api/admin/beta").then((r) => r.json()),
      fetch("/api/admin/beta?view=waitlist").then((r) => r.json()),
      fetch("/api/admin/beta?view=invites").then((r) => r.json()),
    ]);
    setInsights(overview.insights ?? null);
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
      setMessage("Invite sent");
      await refresh();
    }
    setBusy(null);
  }

  async function createInvite() {
    setBusy("invite");
    const res = await fetch("/api/admin/beta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_invite", expiresInDays: 14 }),
    });
    const data = await res.json();
    if (res.ok) setMessage(`Created: ${data.code}`);
    await refresh();
    setBusy(null);
  }

  return (
    <div className="space-y-10">
      {message ? (
        <p className="text-sm text-cosmic-violet" role="status">
          {message}
        </p>
      ) : null}

      {insights ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Resonance score" value={`${insights.resonanceScore}%`} />
          <Stat label="Beta members" value={insights.betaMembers} />
          <Stat label="Waitlist pending" value={insights.waitlistPending} />
          <Stat label="Beta retention" value={`${insights.betaRetentionPct}%`} />
        </div>
      ) : null}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-widest text-zen-muted">
            Waitlist
          </h2>
          <button
            type="button"
            onClick={() => void createInvite()}
            disabled={busy === "invite"}
            className="auth-btn-secondary text-xs"
          >
            + Open invite
          </button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase text-zen-muted">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {waitlist.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 text-foreground">{row.email}</td>
                  <td className="px-4 py-3 capitalize text-zen-muted">{row.status}</td>
                  <td className="px-4 py-3 text-zen-muted">
                    {row.waitlistPosition ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.status === "pending" ? (
                      <button
                        type="button"
                        disabled={busy === row.id}
                        onClick={() => void approve(row.id)}
                        className="text-xs text-amber-gold hover:underline"
                      >
                        Approve & invite
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm uppercase tracking-widest text-zen-muted">
          Invite codes
        </h2>
        <ul className="space-y-2 text-sm">
          {invites.map((inv) => (
            <li
              key={inv.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-4 py-3"
            >
              <code className="text-amber-gold">{inv.code}</code>
              <span className="text-zen-muted">
                {inv.useCount}/{inv.maxUses}
                {inv.revokedAt ? " · revoked" : ""}
                {inv.email ? ` · ${inv.email}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-zen-surface/50 p-4">
      <p className="text-[10px] uppercase tracking-widest text-zen-muted">{label}</p>
      <p className="mt-1 font-serif text-2xl text-foreground">{value}</p>
    </div>
  );
}
