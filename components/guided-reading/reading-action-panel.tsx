"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { gentleEase } from "@/lib/guided-reading/motion";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { useAnalytics } from "@/hooks/use-analytics";

type ReadingActionPanelProps = {
  readingId: string;
  onShare: () => void;
  onNewReading: () => void;
};

export function ReadingActionPanel({
  readingId,
  onShare,
  onNewReading,
}: ReadingActionPanelProps) {
  const { track, trackButton } = useAnalytics();

  const actions = [
    {
      label: "Save to journal",
      href: `/history/${readingId}`,
      primary: true,
      onClick: undefined as (() => void) | undefined,
    },
    {
      label: "Share quietly",
      primary: false,
      onClick: onShare,
    },
    {
      label: "Continue reflecting",
      href: `/oracle/chat`,
      primary: false,
    },
    {
      label: "Another question",
      primary: false,
      onClick: onNewReading,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, ...gentleEase, duration: 1 }}
      className="mt-10 rounded-2xl border border-white/[0.08] bg-zen-surface/50 p-6 backdrop-blur-md sm:p-8"
      aria-label="What comes next"
    >
      <p className="text-center text-[10px] font-medium uppercase tracking-[0.35em] text-zen-muted">
        When you are ready
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {actions.map((action) =>
          action.href ? (
            <Link
              key={action.label}
              href={action.href}
              onClick={() => {
                if (action.label === "Save to journal") {
                  track(ANALYTICS_EVENTS.READING_SAVED, {
                    properties: { reading_id: readingId },
                  });
                }
                if (action.label === "Continue reflecting") {
                  track(ANALYTICS_EVENTS.FOLLOWUP_QUESTION_ASKED, {
                    properties: { reading_id: readingId },
                  });
                }
                trackButton(action.label.toLowerCase().replace(/\s+/g, "_"));
              }}
              className={
                action.primary
                  ? "auth-btn-primary min-h-[48px] text-center text-sm"
                  : "flex min-h-[48px] items-center justify-center rounded-full border border-white/12 bg-zen-bg/30 text-sm text-foreground/90 transition-colors hover:border-amber-gold/25 hover:bg-amber-gold/5"
              }
            >
              {action.label}
            </Link>
          ) : (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                action.onClick?.();
                trackButton(action.label.toLowerCase().replace(/\s+/g, "_"));
              }}
              className="flex min-h-[48px] items-center justify-center rounded-full border border-white/12 bg-zen-bg/30 text-sm text-foreground/90 transition-colors hover:border-amber-gold/25 hover:bg-amber-gold/5"
            >
              {action.label}
            </button>
          ),
        )}
      </div>
    </motion.section>
  );
}
