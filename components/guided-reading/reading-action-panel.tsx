"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { gentleEase } from "@/lib/guided-reading/motion";

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
  const actions = [
    {
      label: "Save Reading",
      href: `/history/${readingId}`,
      primary: true,
      onClick: undefined as (() => void) | undefined,
    },
    {
      label: "Share Reading",
      primary: false,
      onClick: onShare,
    },
    {
      label: "Ask Follow-up Question",
      href: `/oracle/chat`,
      primary: false,
    },
    {
      label: "Start New Reading",
      primary: false,
      onClick: onNewReading,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, ...gentleEase }}
      className="mt-14 rounded-2xl border border-white/10 bg-gradient-to-br from-zen-surface/80 via-zen-elevated/40 to-cosmic-purple/10 p-6 backdrop-blur-xl sm:p-8"
      aria-label="Continue your journey"
    >
      <p className="text-center text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold">
        Continue Your Journey
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {actions.map((action) =>
          action.href ? (
            <Link
              key={action.label}
              href={action.href}
              className={
                action.primary
                  ? "auth-btn-primary min-h-[48px] text-center text-sm transition-transform hover:scale-[1.02]"
                  : "flex min-h-[48px] items-center justify-center rounded-full border border-white/15 bg-zen-bg/40 text-sm text-foreground backdrop-blur-sm transition-all hover:border-amber-gold/35 hover:bg-amber-gold/5 hover:shadow-[0_0_24px_-8px_rgba(197,160,89,0.4)]"
              }
            >
              {action.label}
            </Link>
          ) : (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="flex min-h-[48px] items-center justify-center rounded-full border border-white/15 bg-zen-bg/40 text-sm text-foreground backdrop-blur-sm transition-all hover:border-amber-gold/35 hover:bg-amber-gold/5 hover:shadow-[0_0_24px_-8px_rgba(197,160,89,0.4)]"
            >
              {action.label}
            </button>
          ),
        )}
      </div>
    </motion.section>
  );
}
