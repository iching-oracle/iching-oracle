"use client";

import { useState } from "react";
import { showError, showSuccess } from "@/hooks/use-app-toast";

type ShareReadingQuickButtonProps = {
  readingId: string;
  className?: string;
};

export function ShareReadingQuickButton({
  readingId,
  className = "rounded-full border border-amber-gold/30 bg-amber-gold/10 px-3 py-1.5 text-xs font-medium text-amber-gold hover:border-amber-gold/50",
}: ShareReadingQuickButtonProps) {
  const [busy, setBusy] = useState(false);

  async function handleShare() {
    setBusy(true);
    try {
      const res = await fetch(`/api/readings/${readingId}/share`, {
        method: "POST",
      });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Could not create share link");
      }

      await navigator.clipboard.writeText(data.url);
      showSuccess("Share link copied");
    } catch {
      showError("Could not copy share link. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      disabled={busy}
      className={`disabled:opacity-60 ${className}`}
    >
      {busy ? "Sharing…" : "Share Reading"}
    </button>
  );
}
