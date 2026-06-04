"use client";

import { motion } from "framer-motion";

type PatternCardProps = {
  label: string;
  value: string;
  hint?: string;
  index?: number;
};

export function PatternCard({ label, value, hint, index = 0 }: PatternCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index }}
      className="rounded-2xl border border-white/10 bg-zen-elevated/50 p-4 backdrop-blur-sm"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-cosmic-violet">
        {label}
      </p>
      <p className="mt-2 font-serif text-lg text-foreground/95">{value}</p>
      {hint ? (
        <p className="mt-2 text-xs leading-relaxed text-zen-muted">{hint}</p>
      ) : null}
    </motion.article>
  );
}
