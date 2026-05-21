"use client";

import { motion } from "framer-motion";

type OracleQuoteProps = {
  label: string;
  children: React.ReactNode;
  delay?: number;
  accent?: "gold" | "violet" | "muted";
};

const ACCENT_BORDER = {
  gold: "border-amber-gold/25",
  violet: "border-cosmic-violet/30",
  muted: "border-white/10",
} as const;

const ACCENT_LABEL = {
  gold: "text-amber-glow",
  violet: "text-cosmic-violet",
  muted: "text-zen-muted",
} as const;

export function OracleQuote({
  label,
  children,
  delay = 0,
  accent = "muted",
}: OracleQuoteProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-2xl border bg-zen-surface/50 p-5 backdrop-blur-xl sm:p-6 ${ACCENT_BORDER[accent]}`}
    >
      <h3
        className={`text-xs font-medium uppercase tracking-[0.22em] ${ACCENT_LABEL[accent]}`}
      >
        {label}
      </h3>
      <div className="mt-3 text-base leading-relaxed text-foreground/90">
        {children}
      </div>
    </motion.section>
  );
}
