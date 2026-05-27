"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type CookiePreferencesModalProps = {
  open: boolean;
  onClose: () => void;
  initialAnalytics: boolean;
  initialMarketing: boolean;
  onSave: (analytics: boolean, marketing: boolean) => void;
};

export function CookiePreferencesModal({
  open,
  onClose,
  initialAnalytics,
  initialMarketing,
  onSave,
}: CookiePreferencesModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [marketing, setMarketing] = useState(initialMarketing);

  useEffect(() => {
    setAnalytics(initialAnalytics);
    setMarketing(initialMarketing);
  }, [initialAnalytics, initialMarketing, open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-white/10 bg-zen-surface p-0 text-foreground backdrop:bg-black/75"
      aria-labelledby="cookie-prefs-title"
    >
      <div className="p-6 sm:p-8">
        <h2 id="cookie-prefs-title" className="font-serif text-xl">
          Cookie preferences
        </h2>
        <p className="mt-2 text-sm text-zen-muted">
          Manage optional cookies. Read our{" "}
          <Link href="/cookies" className="text-amber-gold hover:underline">
            cookie policy
          </Link>
          .
        </p>

        <ul className="mt-6 space-y-4">
          <li className="rounded-xl border border-white/10 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">Essential</p>
                <p className="text-xs text-zen-muted">Required for the service</p>
              </div>
              <span className="text-xs text-amber-gold">Always on</span>
            </div>
          </li>
          <li className="rounded-xl border border-white/10 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">Analytics</p>
                <p className="text-xs text-zen-muted">PostHog / Google Analytics</p>
              </div>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="h-5 w-5 accent-amber-gold"
                aria-label="Enable analytics cookies"
              />
            </div>
          </li>
          <li className="rounded-xl border border-white/10 p-4 opacity-60">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">Marketing</p>
                <p className="text-xs text-zen-muted">Not used yet</p>
              </div>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                disabled
                className="h-5 w-5 accent-amber-gold"
                aria-label="Marketing cookies (coming soon)"
              />
            </div>
          </li>
        </ul>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => onSave(analytics, marketing)}
            className="auth-btn-primary min-h-[44px] flex-1 text-sm"
          >
            Save preferences
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-full border border-white/15 px-5 text-sm text-zen-muted"
          >
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
}
