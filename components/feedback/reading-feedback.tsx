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

const OPTIONS: { value: ReadingResonance; label: string }[] = [
  { value: "deeply", label: "Deeply" },
  { value: "somewhat", label: "Somewhat" },
  { value: "not_really", label: "Not quite" },
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
      showSuccess("Thank you — noted with care.");
    } catch {
      /* non-blocking */
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.75, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="mt-10 rounded-2xl border border-white/[0.08] bg-zen-surface/30 p-6 text-center backdrop-blur-sm"
      aria-label="Reading reflection"
    >
      {submitted ? (
        <p className="text-sm leading-relaxed text-zen-muted">
          {submitted === "deeply"
            ? "We are glad it met you where you are."
            : submitted === "somewhat"
              ? "Thank you — your note helps us listen better."
              : "Thank you for your honesty."}
        </p>
      ) : showComment ? (
        <div className="space-y-4">
          <p className="text-sm text-foreground/90">
            Anything you would like to leave behind?
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="auth-input w-full resize-none text-left text-sm"
            placeholder="Optional — what felt true, unclear, or unexpected?"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit("somewhat", comment)}
            className="auth-btn-primary w-full sm:w-auto"
          >
            Leave a note
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-foreground/90">Did this land with you?</p>
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
                className="flex min-h-[48px] items-center justify-center rounded-full border border-white/12 bg-zen-bg/30 px-5 text-sm transition-colors hover:border-amber-gold/30 hover:bg-amber-gold/5 disabled:opacity-50"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </motion.section>
  );
}
