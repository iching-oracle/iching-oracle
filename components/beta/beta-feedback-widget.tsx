"use client";

import { useState } from "react";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { useAnalytics } from "@/hooks/use-analytics";
import { showSuccess } from "@/hooks/use-app-toast";
import { StarRating } from "@/components/beta/star-rating";

type FeedbackModalType = "pulse" | "bug" | "feature" | null;

export function BetaFeedbackWidget() {
  const { track } = useAnalytics();
  const [open, setOpen] = useState<FeedbackModalType>(null);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [busy, setBusy] = useState(false);

  function close() {
    setOpen(null);
    setMessage("");
    setRating(0);
  }

  async function submit(type: "pulse" | "bug" | "feature") {
    if (type === "pulse" && rating < 1) return;
    if (type !== "pulse" && !message.trim()) return;
    if (busy) return;

    setBusy(true);
    try {
      const res = await fetch("/api/beta/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: type === "pulse" ? "general" : type,
          message: message.trim(),
          rating: rating > 0 ? rating : undefined,
          severity: type === "bug" ? severity : undefined,
          pagePath:
            typeof window !== "undefined" ? window.location.pathname : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      track(
        type === "bug"
          ? ANALYTICS_EVENTS.BETA_BUG_REPORTED
          : type === "feature"
            ? ANALYTICS_EVENTS.BETA_FEATURE_REQUESTED
            : ANALYTICS_EVENTS.BETA_FEEDBACK_SUBMITTED,
        { properties: { rating, severity } },
      );
      showSuccess("Thank you — we read every note.");
      close();
    } catch {
      /* silent */
    } finally {
      setBusy(false);
    }
  }

  const canSubmit =
    open === "pulse"
      ? rating > 0
      : open === "bug" || open === "feature"
        ? message.trim().length > 0
        : false;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2 sm:bottom-8 sm:right-8">
        <button
          type="button"
          onClick={() => setOpen("pulse")}
          className="rounded-full border border-amber-gold/30 bg-zen-surface/95 px-4 py-2.5 text-xs font-medium text-amber-gold shadow-lg backdrop-blur-md transition-colors hover:border-amber-gold/50"
        >
          Feedback
        </button>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/55 p-4 sm:items-center"
          role="dialog"
          aria-modal
          aria-labelledby="beta-feedback-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zen-surface p-6 shadow-2xl">
            <h2 id="beta-feedback-title" className="font-serif text-xl text-foreground">
              {open === "pulse"
                ? "How is the beta?"
                : open === "bug"
                  ? "Report an issue"
                  : "Suggest a feature"}
            </h2>
            <p className="mt-2 text-sm text-zen-muted">
              Brief, honest notes help us shape the oracle.
            </p>

            {open === "pulse" ? (
              <>
                <div className="mt-5">
                  <StarRating
                    value={rating}
                    onChange={setRating}
                    label="Overall experience"
                  />
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="auth-input mt-4 w-full resize-none text-sm"
                  placeholder="Anything else? (optional)"
                />
                <div className="mt-4 flex gap-2 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen("bug");
                      setRating(0);
                    }}
                    className="text-xs text-zen-muted hover:text-foreground"
                  >
                    Report bug →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen("feature");
                      setRating(0);
                    }}
                    className="text-xs text-zen-muted hover:text-foreground"
                  >
                    Feature idea →
                  </button>
                </div>
              </>
            ) : null}

            {open === "bug" ? (
              <>
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
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="auth-input mt-4 w-full resize-none text-sm"
                  placeholder="What happened? What were you trying to do?"
                />
              </>
            ) : null}

            {open === "feature" ? (
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="auth-input mt-4 w-full resize-none text-sm"
                placeholder="What would make your practice deeper?"
              />
            ) : null}

            <div className="mt-5 flex gap-3">
              <button type="button" onClick={close} className="auth-btn-secondary flex-1">
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || !canSubmit}
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
