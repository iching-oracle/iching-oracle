"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { useAnalytics } from "@/hooks/use-analytics";
import { showSuccess } from "@/hooks/use-app-toast";

type ReadingFeedbackProps = {
  readingId: string;
  category?: string;
};

export function ReadingFeedback({ readingId, category }: ReadingFeedbackProps) {
  const { track } = useAnalytics();
  const [submitted, setSubmitted] = useState<"helpful" | "not_helpful" | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  async function submit(helpful: boolean) {
    if (submitted || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/readings/${readingId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpful, category }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(helpful ? "helpful" : "not_helpful");
      track(ANALYTICS_EVENTS.READING_FEEDBACK, {
        properties: {
          reading_id: readingId,
          helpful,
          category,
        },
      });
      showSuccess("Thank you — your feedback helps the oracle grow.");
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
          {submitted === "helpful"
            ? "Glad this guidance resonated."
            : "Thank you — we'll work to improve."}
        </p>
      ) : (
        <>
          <p className="text-sm text-foreground">Was this guidance helpful?</p>
          <div className="mt-4 flex justify-center gap-4">
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit(true)}
              className="flex min-h-[48px] min-w-[120px] items-center justify-center gap-2 rounded-full border border-white/15 bg-zen-bg/40 px-5 text-sm transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10 disabled:opacity-50"
              aria-label="Helpful"
            >
              <span aria-hidden>👍</span> Helpful
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit(false)}
              className="flex min-h-[48px] min-w-[120px] items-center justify-center gap-2 rounded-full border border-white/15 bg-zen-bg/40 px-5 text-sm transition-all hover:border-white/25 disabled:opacity-50"
              aria-label="Not helpful"
            >
              <span aria-hidden>👎</span> Not helpful
            </button>
          </div>
        </>
      )}
    </motion.section>
  );
}
