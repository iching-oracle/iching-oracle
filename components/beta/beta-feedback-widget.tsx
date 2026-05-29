"use client";

import { useState } from "react";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { useAnalytics } from "@/hooks/use-analytics";
import { showSuccess } from "@/hooks/use-app-toast";

type FeedbackModalType = "bug" | "feature" | null;

export function BetaFeedbackWidget() {
  const { track } = useAnalytics();
  const [open, setOpen] = useState<FeedbackModalType>(null);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [busy, setBusy] = useState(false);

  async function submit(type: "bug" | "feature") {
    if (!message.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/beta/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          message: message.trim(),
          severity: type === "bug" ? severity : undefined,
          pagePath: typeof window !== "undefined" ? window.location.pathname : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      track(
        type === "bug"
          ? ANALYTICS_EVENTS.BETA_BUG_REPORTED
          : ANALYTICS_EVENTS.BETA_FEATURE_REQUESTED,
        { properties: { severity } },
      );
      showSuccess("Thank you — we read every note.");
      setOpen(null);
      setMessage("");
    } catch {
      /* silent */
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2 sm:bottom-8 sm:right-8">
        <button
          type="button"
          onClick={() => setOpen("feature")}
          className="rounded-full border border-white/15 bg-zen-surface/90 px-4 py-2 text-xs font-medium text-zen-muted shadow-lg backdrop-blur-md transition-colors hover:border-amber-gold/40 hover:text-amber-gold"
        >
          Feature idea
        </button>
        <button
          type="button"
          onClick={() => setOpen("bug")}
          className="rounded-full border border-white/15 bg-zen-surface/90 px-4 py-2 text-xs font-medium text-zen-muted shadow-lg backdrop-blur-md transition-colors hover:border-red-400/40 hover:text-red-300"
        >
          Report issue
        </button>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal
          aria-labelledby="beta-feedback-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zen-surface p-6 shadow-xl">
            <h2 id="beta-feedback-title" className="font-serif text-xl text-foreground">
              {open === "bug" ? "Report an issue" : "Suggest a feature"}
            </h2>
            <p className="mt-2 text-sm text-zen-muted">
              Help shape the oracle — brief, honest notes are perfect.
            </p>
            {open === "bug" ? (
              <select
                value={severity}
                onChange={(e) =>
                  setSeverity(e.target.value as "low" | "medium" | "high")
                }
                className="auth-input mt-4 w-full text-sm"
              >
                <option value="low">Low — minor annoyance</option>
                <option value="medium">Medium — confusing or broken</option>
                <option value="high">High — blocked from using</option>
              </select>
            ) : null}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="auth-input mt-4 w-full resize-none text-sm"
              placeholder={
                open === "bug"
                  ? "What happened? What were you trying to do?"
                  : "What would make your practice deeper?"
              }
            />
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="auth-btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || !message.trim()}
                onClick={() => void submit(open)}
                className="auth-btn-primary flex-1 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
