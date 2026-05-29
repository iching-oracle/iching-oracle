"use client";

import Link from "next/link";
import { useState } from "react";
import type { EmailPreferenceKey } from "@/lib/email/pref-labels";

type UnsubscribeActionsProps = {
  token: string;
  initialPreferences: Record<EmailPreferenceKey, boolean>;
  labels: Record<EmailPreferenceKey, { title: string; description: string }>;
};

export function UnsubscribeActions({
  token,
  initialPreferences,
  labels,
}: UnsubscribeActionsProps) {
  const [prefs, setPrefs] = useState(initialPreferences);
  const [saved, setSaved] = useState(false);

  const toggle = async (key: EmailPreferenceKey) => {
    const next = !prefs[key];
    const res = await fetch(`/api/unsubscribe/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: next }),
    });
    if (res.ok) {
      setPrefs((p) => ({ ...p, [key]: next }));
      setSaved(true);
    }
  };

  const prefKeys = Object.keys(labels) as EmailPreferenceKey[];

  return (
    <div className="mt-6 space-y-4">
      <ul className="space-y-3">
        {prefKeys.map((key) => (
          <li
            key={key}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{labels[key].title}</p>
            </div>
            <button
              type="button"
              onClick={() => toggle(key)}
              className="text-xs uppercase tracking-wider text-amber-gold hover:underline"
            >
              {prefs[key] ? "On" : "Off"}
            </button>
          </li>
        ))}
      </ul>

      {saved ? (
        <p className="text-sm text-cosmic-violet" role="status">
          Preferences updated.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 pt-2">
        <Link
          href={`/unsubscribe/${token}?confirm=all`}
          className="text-center text-sm text-zen-muted hover:text-red-300 hover:underline"
        >
          Unsubscribe from all optional emails
        </Link>
        <Link href="/login" className="auth-btn-secondary text-center">
          Sign in to manage account
        </Link>
      </div>
    </div>
  );
}
