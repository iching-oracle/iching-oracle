"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/format-date";
import type { BetaAdminInviteRow } from "@/types/beta";

type InviteCodesSectionProps = {
  invites: BetaAdminInviteRow[];
  busy: string | null;
  onRefresh: () => Promise<void>;
  onMessage: (message: string) => void;
  setBusy: (id: string | null) => void;
};

function StatusBadge({ invite }: { invite: BetaAdminInviteRow }) {
  if (!invite.isActive) {
    return (
      <span className="rounded-full border border-red-400/25 bg-red-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-red-300/90">
        Revoked
      </span>
    );
  }
  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
    return (
      <span className="rounded-full border border-zen-muted/30 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zen-muted">
        Expired
      </span>
    );
  }
  if (invite.remaining === 0) {
    return (
      <span className="rounded-full border border-amber-gold/25 bg-amber-gold/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-gold/90">
        Full
      </span>
    );
  }
  return (
    <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-300/90">
      Active
    </span>
  );
}

export function InviteCodesSection({
  invites,
  busy,
  onRefresh,
  onMessage,
  setBusy,
}: InviteCodesSectionProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [code, setCode] = useState("");
  const [maxUses, setMaxUses] = useState("100");
  const [source, setSource] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  async function copyCode(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      onMessage(`Copied ${value}`);
    } catch {
      onMessage("Could not copy to clipboard");
    }
  }

  async function createSingleInvite() {
    setBusy("single-invite");
    const res = await fetch("/api/admin/beta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_invite", expiresInDays: 14 }),
    });
    const data = (await res.json()) as { code?: string };
    if (res.ok && data.code) onMessage(`Created: ${data.code}`);
    await onRefresh();
    setBusy(null);
  }

  async function createSharedInvite(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setBusy("shared-invite");

    const res = await fetch("/api/admin/beta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_shared_invite",
        code: code.trim(),
        maxUses: Number(maxUses),
        source: source.trim() || undefined,
        expiresAt: expiresAt || null,
      }),
    });
    const data = (await res.json()) as { code?: string; error?: string };

    if (!res.ok) {
      setCreateError(data.error ?? "Could not create code");
      setBusy(null);
      return;
    }

    onMessage(`Shared code live: ${data.code}`);
    setCode("");
    setMaxUses("100");
    setSource("");
    setExpiresAt("");
    setShowCreate(false);
    await onRefresh();
    setBusy(null);
  }

  async function revokeInvite(inviteId: string) {
    setBusy(inviteId);
    await fetch("/api/admin/beta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "revoke_invite", inviteId }),
    });
    await onRefresh();
    setBusy(null);
  }

  async function reactivateInvite(inviteId: string) {
    setBusy(inviteId);
    const res = await fetch("/api/admin/beta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reactivate_invite", inviteId }),
    });
    if (!res.ok) onMessage("Could not reactivate — code may be expired.");
    await onRefresh();
    setBusy(null);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-sm uppercase tracking-widest text-zen-muted">
            Invite codes
          </h2>
          <p className="mt-1 text-xs text-zen-muted/80">
            Shared beta codes support multiple registrations with capacity
            tracking.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void createSingleInvite()}
            disabled={busy === "single-invite"}
            className="auth-btn-secondary text-xs"
          >
            + Single-use
          </button>
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="auth-btn-primary text-xs"
          >
            {showCreate ? "Close" : "+ Shared code"}
          </button>
        </div>
      </div>

      {showCreate ? (
        <form
          onSubmit={(e) => void createSharedInvite(e)}
          className="rounded-2xl border border-white/10 bg-zen-surface/40 p-5 backdrop-blur-sm"
        >
          <p className="font-serif text-lg text-foreground">New shared invite</p>
          <p className="mt-1 text-xs text-zen-muted">
            Example: QUIETPATH · 100 seats · Reddit Beta
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="auth-label">Code name</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="auth-input mt-1 font-mono tracking-wider"
                placeholder="QUIETPATH"
                required
                minLength={4}
                maxLength={32}
              />
            </label>
            <label className="block text-sm">
              <span className="auth-label">Max users</span>
              <input
                type="number"
                min={1}
                max={10000}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="auth-input mt-1"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="auth-label">Source label</span>
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="auth-input mt-1"
                placeholder="Reddit Beta"
              />
            </label>
            <label className="block text-sm">
              <span className="auth-label">Expiration (optional)</span>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="auth-input mt-1"
              />
            </label>
          </div>
          {createError ? (
            <p className="mt-3 text-sm text-red-300" role="alert">
              {createError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy === "shared-invite"}
            className="auth-btn-primary mt-5 text-sm disabled:opacity-50"
          >
            {busy === "shared-invite" ? "Creating…" : "Create shared code"}
          </button>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="border-b border-white/10 text-[10px] uppercase tracking-widest text-zen-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Usage</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {invites.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-zen-muted"
                >
                  No invite codes yet
                </td>
              </tr>
            ) : (
              invites.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-amber-gold">{inv.code}</code>
                      <button
                        type="button"
                        onClick={() => void copyCode(inv.code)}
                        className="text-[10px] uppercase tracking-wider text-zen-muted transition-colors hover:text-amber-gold"
                      >
                        Copy
                      </button>
                    </div>
                    {inv.email ? (
                      <p className="mt-0.5 text-xs text-zen-muted">{inv.email}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground/90">
                    <span className="text-foreground">{inv.usedCount}</span>
                    <span className="text-zen-muted"> / {inv.maxUses}</span>
                    <p className="text-xs text-zen-muted">
                      {inv.remaining} remaining
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-zen-muted">
                    {inv.source ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-zen-muted">
                    {inv.expiresAt ? formatDateTime(inv.expiresAt) : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge invite={inv} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {inv.isActive ? (
                      <button
                        type="button"
                        disabled={busy === inv.id}
                        onClick={() => void revokeInvite(inv.id)}
                        className="text-xs text-red-300/90 hover:underline disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy === inv.id}
                        onClick={() => void reactivateInvite(inv.id)}
                        className="text-xs text-amber-gold hover:underline disabled:opacity-50"
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
