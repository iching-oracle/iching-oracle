"use client";

import { useState } from "react";
import type { EmailPreferenceKey } from "@/lib/email/pref-labels";
import { EMAIL_PREF_KEYS, EMAIL_PREF_LABELS } from "@/lib/email/pref-labels";

export type EmailPreferencesState = {
  emailDailyGuidance: boolean;
  emailWeeklyReflection: boolean;
  emailReengagement: boolean;
  emailProductUpdates: boolean;
  emailMarketing: boolean;
  globallyUnsubscribed: boolean;
};

type EmailPreferencesPanelProps = {
  initialPreferences: EmailPreferencesState;
};

const PREF_KEYS = EMAIL_PREF_KEYS;

export function EmailPreferencesPanel({
  initialPreferences,
}: EmailPreferencesPanelProps) {
  const [prefs, setPrefs] = useState(initialPreferences);
  const [busy, setBusy] = useState<EmailPreferenceKey | "all" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const updatePref = async (key: EmailPreferenceKey, value: boolean) => {
    setBusy(key);
    setMessage(null);

    const res = await fetch("/api/user/email-preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });

    if (res.ok) {
      const next = (await res.json()) as EmailPreferencesState;
      setPrefs(next);
      setMessage("Preferences saved");
    } else {
      setMessage("Could not save preferences. Please try again.");
    }

    setBusy(null);
  };

  const unsubscribeAll = async () => {
    if (
      !confirm(
        "Unsubscribe from all non-essential emails? You will still receive account and security messages.",
      )
    ) {
      return;
    }

    setBusy("all");
    const res = await fetch("/api/user/email-preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailDailyGuidance: false,
        emailWeeklyReflection: false,
        emailReengagement: false,
        emailProductUpdates: false,
        emailMarketing: false,
        weeklyOracleEnabled: false,
        globalUnsubscribe: true,
      }),
    });

    if (res.ok) {
      const next = (await res.json()) as EmailPreferencesState;
      setPrefs(next);
      setMessage("You have been unsubscribed from all optional emails.");
    }

    setBusy(null);
  };

  return (
    <div className="space-y-6">
      {prefs.globallyUnsubscribed ? (
        <p className="rounded-xl border border-amber-gold/25 bg-amber-gold/10 px-4 py-3 text-sm text-amber-gold">
          You are currently unsubscribed from optional emails. Toggle any
          preference below to re-subscribe.
        </p>
      ) : null}

      {message ? (
        <p className="text-sm text-cosmic-violet" role="status">
          {message}
        </p>
      ) : null}

      <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-zen-surface/70">
        {PREF_KEYS.map((key) => {
          const meta = EMAIL_PREF_LABELS[key];
          const enabled = prefs[key];
          return (
            <li
              key={key}
              className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">{meta.title}</p>
                <p className="mt-1 text-sm text-zen-muted">{meta.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                disabled={busy === key}
                onClick={() => updatePref(key, !enabled)}
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
                <span className="sr-only">
                  {enabled ? "Disable" : "Enable"} {meta.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="rounded-2xl border border-white/10 bg-zen-surface/50 p-5 sm:p-6">
        <h2 className="font-serif text-lg text-foreground">Privacy & compliance</h2>
        <p className="mt-2 text-sm leading-relaxed text-zen-muted">
          Transactional emails (account verification, password reset, billing)
          are always sent when needed. Optional emails respect your choices here
          and can be changed at any time.
        </p>
        <button
          type="button"
          onClick={unsubscribeAll}
          disabled={busy === "all"}
          className="mt-4 text-sm text-zen-muted underline-offset-4 transition-colors hover:text-red-300 hover:underline"
        >
          Unsubscribe from all optional emails
        </button>
      </div>
    </div>
  );
}
