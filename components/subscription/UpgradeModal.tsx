"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { useAnalytics } from "@/hooks/use-analytics";

type UpgradeModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
};

export function UpgradeModal({
  open,
  onClose,
  title = "Continue your journey",
  message = "You've reached today's free reading limit. Premium opens unlimited consultations and deeper AI insight.",
}: UpgradeModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { track } = useAnalytics();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      track(ANALYTICS_EVENTS.PAYWALL_VIEWED, {
        properties: { source: "upgrade_modal" },
      });
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, track]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[calc(100%-2rem)] max-w-md rounded-2xl border border-amber-gold/25 bg-zen-surface p-0 text-foreground backdrop:bg-black/75"
    >
      <div className="relative overflow-hidden p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cosmic-purple/30 blur-3xl"
          aria-hidden
        />
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-cosmic-violet">
          Premium
        </p>
        <h2 className="relative mt-2 font-serif text-2xl text-foreground">
          {title}
        </h2>
        <p className="relative mt-3 text-sm leading-relaxed text-zen-muted">
          {message}
        </p>
        <div className="relative mt-6 flex flex-col gap-2">
          <Link
            href="/pricing"
            className="auth-btn-primary text-center"
            onClick={onClose}
          >
            View Premium plans
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="auth-btn-secondary text-sm"
          >
            Not now
          </button>
        </div>
      </div>
    </dialog>
  );
}
