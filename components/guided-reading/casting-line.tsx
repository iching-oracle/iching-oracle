"use client";

import { motion } from "framer-motion";
import {
  lineValueIsChanging,
  lineValueIsYang,
} from "@/lib/guided-reading/line-display";

type CastingLineProps = {
  value: number | null;
  revealed: boolean;
  index: number;
};

export function CastingLine({ value, revealed, index }: CastingLineProps) {
  const isYang = value !== null ? lineValueIsYang(value) : null;
  const changing = value !== null && lineValueIsChanging(value);

  return (
    <motion.div
      layout
      className="flex w-full max-w-[200px] items-center gap-3"
      initial={{ opacity: 0.3 }}
      animate={{ opacity: revealed ? 1 : 0.35 }}
    >
      <span className="w-5 text-right text-[10px] tabular-nums text-zen-muted">
        {index + 1}
      </span>
      <div className="flex-1">
        {!revealed || isYang === null ? (
          <div className="h-2 w-full rounded-full bg-white/10" />
        ) : isYang ? (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`h-2 w-full origin-left rounded-full ${
              changing
                ? "bg-amber-gold shadow-[0_0_16px_rgba(251,191,36,0.5)]"
                : "bg-amber-gold/90"
            }`}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-between gap-3"
          >
            <div
              className={`h-2 flex-1 rounded-full ${
                changing ? "bg-cosmic-violet shadow-[0_0_12px_rgba(139,92,246,0.4)]" : "bg-amber-gold/70"
              }`}
            />
            <div
              className={`h-2 flex-1 rounded-full ${
                changing ? "bg-cosmic-violet shadow-[0_0_12px_rgba(139,92,246,0.4)]" : "bg-amber-gold/70"
              }`}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
