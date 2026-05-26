"use client";

import { motion } from "framer-motion";

type InsightStatCardProps = {
  label: string;
  value: string;
  hint?: string;
  delay?: number;
};

export function InsightStatCard({
  label,
  value,
  hint,
  delay = 0,
}: InsightStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-zen-elevated/70 via-zen-surface/50 to-cosmic-deep/15 p-5 backdrop-blur-xl transition-shadow hover:shadow-[0_0_32px_-12px_rgba(197,160,89,0.35)]"
    >
      <p className="text-[10px] font-medium uppercase tracking-widest text-zen-muted">
        {label}
      </p>
      <p className="mt-2 font-serif text-2xl text-amber-glow">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zen-muted">{hint}</p> : null}
    </motion.div>
  );
}
