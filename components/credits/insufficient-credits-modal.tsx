"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { CREDITS } from "@/lib/atmosphere/copy";

type InsufficientCreditsModalProps = {
  open: boolean;
  onClose: () => void;
  message?: string;
  code?: string;
};

export function InsufficientCreditsModal({
  open,
  onClose,
  message = CREDITS.insufficient,
  code,
}: InsufficientCreditsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const isPremiumRequired = code === "PREMIUM_REQUIRED";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[calc(100%-2rem)] max-w-md rounded-2xl border border-amber-gold/20 bg-zen-surface p-0 text-foreground backdrop:bg-black/75"
    >
      <div className="relative overflow-hidden p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cosmic-purple/20 blur-3xl"
          aria-hidden
        />
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-zen-muted">
          {isPremiumRequired ? "Membership" : "This period"}
        </p>
        <h2 className="relative mt-2 font-serif text-2xl">
          {isPremiumRequired ? CREDITS.premium : "A gentle pause"}
        </h2>
        <p className="relative mt-3 text-sm leading-relaxed text-zen-muted">
          {message}
        </p>
        <div className="relative mt-6 flex flex-col gap-2">
          <Link href="/pricing" className="auth-btn-primary text-center" onClick={onClose}>
            {CREDITS.upgrade}
          </Link>
          <Link
            href="/billing"
            className="auth-btn-secondary text-center text-sm"
            onClick={onClose}
          >
            {CREDITS.billing}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="py-2 text-sm text-zen-muted transition-colors hover:text-foreground"
          >
            {CREDITS.notNow}
          </button>
        </div>
      </div>
    </dialog>
  );
}
