"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  feedbackCategoryLabel,
  feedbackSourceLabel,
} from "@/lib/admin/feedback-labels";
import { formatDateTime } from "@/lib/format-date";
import type { AdminFeedbackRow } from "@/types/admin-feedback";

type FeedbackDetailDrawerProps = {
  item: AdminFeedbackRow | null;
  onClose: () => void;
};

export function FeedbackDetailDrawer({
  item,
  onClose,
}: FeedbackDetailDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!item) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]"
            aria-label="Close feedback detail"
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-detail-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/10 bg-zen-bg shadow-2xl sm:max-w-lg"
          >
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-zen-muted">
                  Feedback detail
                </p>
                <h2
                  id="feedback-detail-title"
                  className="mt-1 font-serif text-lg text-foreground"
                >
                  {feedbackCategoryLabel(item.type)}
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="rounded-lg px-3 py-2 text-sm text-zen-muted transition-colors hover:bg-white/5 hover:text-foreground"
              >
                Close
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
              <dl className="space-y-5 text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-zen-muted">
                    Submitted
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {formatDateTime(item.createdAt, "en-US")}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-zen-muted">
                    User
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {item.userEmail ?? "Anonymous"}
                  </dd>
                  {item.userName ? (
                    <dd className="text-xs text-zen-muted">{item.userName}</dd>
                  ) : null}
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-zen-muted">
                    Rating
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {item.rating != null ? `${item.rating} / 5` : "—"}
                  </dd>
                </div>
                {item.severity ? (
                  <div>
                    <dt className="text-[10px] uppercase tracking-widest text-zen-muted">
                      Severity
                    </dt>
                    <dd className="mt-1 capitalize text-foreground">
                      {item.severity}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-zen-muted">
                    Source
                  </dt>
                  <dd className="mt-1 break-all text-foreground/90">
                    {feedbackSourceLabel(item)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-zen-muted">
                    Message
                  </dt>
                  <dd className="mt-2 whitespace-pre-wrap rounded-xl border border-white/8 bg-zen-surface/50 p-4 leading-relaxed text-foreground/92">
                    {item.message}
                  </dd>
                </div>
              </dl>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
