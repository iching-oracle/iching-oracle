"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { useAnalytics } from "@/hooks/use-analytics";
import { showSuccess } from "@/hooks/use-app-toast";
import type { ReadingResonance } from "@/types/beta";

type ReadingFeedbackProps = {
  readingId: string;
  category?: string;
};

const OPTIONS: { value: ReadingResonance; label: string; emoji: string }[] = [
  { value: "deeply", label: "Deeply", emoji: "✦" },
  { value: "somewhat", label: "Somewhat", emoji: "◦" },
  { value: "not_really", label: "Not really", emoji: "○" },
];

export function ReadingFeedback({ readingId, category }: ReadingFeedbackProps) {
  const { track } = useAnalytics();
  const [submitted, setSubmitted] = useState<ReadingResonance | null>(null);
  const [busy, setBusy] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");

  async function submit(resonance: ReadingResonance, withComment?: string) {
    if (submitted || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/readings/${readingId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resonance,
          comment: withComment?.trim() || undefined,
          category,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(resonance);
      track(ANALYTICS_EVENTS.READING_FEEDBACK, {
        properties: { reading_id: readingId, resonance, category },
      });
      showSuccess("Thank you — your reflection helps us improve.");
    } catch {
      /* non-blocking */
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-10 rounded-2xl border border-white/10 bg-zen-surface/40 p-6 text-center backdrop-blur-md"
      aria-label="Reading feedback"
    >
      {submitted ? (
        <p className="text-sm text-zen-muted">
          {submitted === "deeply"
            ? "We're glad this resonated deeply."
            : submitted === "somewhat"
              ? "Thank you — we'll keep refining."
              : "Thank you for your honesty."}
        </p>
      ) : showComment ? (
        <div className="space-y-4">
          <p className="text-sm text-foreground">Anything you'd like to share?</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="auth-input w-full resize-none text-left text-sm"
            placeholder="Optional — what felt true, confusing, or missing?"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit("somewhat", comment)}
            className="auth-btn-primary w-full sm:w-auto"
          >
            Send feedback
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-foreground">Did this resonate with you?</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            {OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={busy}
                onClick={() => {
                  if (opt.value === "somewhat") {
                    setShowComment(true);
                  } else {
                    void submit(opt.value);
                  }
                }}
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-white/15 bg-zen-bg/40 px-5 text-sm transition-all hover:border-amber-gold/40 hover:bg-amber-gold/10 disabled:opacity-50"
              >
                <span aria-hidden>{opt.emoji}</span> {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </motion.section>
  );
}
