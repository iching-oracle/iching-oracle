"use client";

import { useState } from "react";

type WeeklyOracleSettingsProps = {
  initialEnabled: boolean;
};

export function WeeklyOracleSettings({ initialEnabled }: WeeklyOracleSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function toggle() {
    const next = !enabled;
    setBusy(true);
    setMessage(null);

    const res = await fetch("/api/user/email-preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weeklyOracleEnabled: next }),
    });

    if (res.ok) {
      const data = (await res.json()) as { weeklyOracleEnabled: boolean };
      setEnabled(data.weeklyOracleEnabled);
      setMessage("Preferences saved");
    } else {
      setMessage("Could not save preferences. Please try again.");
    }

    setBusy(false);
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-serif text-xl text-foreground">Newsletter</h2>
        <p className="mt-1 text-sm text-zen-muted">
          A single shared oracle each week — calm, brief, and collective.
        </p>
      </div>

      {message ? (
        <p className="text-sm text-cosmic-violet" role="status">
          {message}
        </p>
      ) : null}

      <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-zen-surface/70 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="font-medium text-foreground">Weekly Oracle Email</p>
          <p className="mt-1 text-sm text-zen-muted">
            Receive one oracle email every Monday.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Enable Weekly Oracle Email"
          disabled={busy}
          onClick={toggle}
          className={`relative mt-1 h-7 w-12 shrink-0 rounded-full border transition-colors ${
            enabled
              ? "border-amber-gold/50 bg-amber-gold/30"
              : "border-white/15 bg-zen-elevated/60"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground shadow transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </section>
  );
}
