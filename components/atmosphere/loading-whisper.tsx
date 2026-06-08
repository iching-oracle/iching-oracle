"use client";

import { motion } from "framer-motion";

type LoadingWhisperProps = {
  message: string;
  className?: string;
};

/** Subtle loading line — unfolding, not computing. */
export function LoadingWhisper({ message, className = "" }: LoadingWhisperProps) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.4, 0.85, 0.4] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      className={`text-center text-sm tracking-wide text-zen-muted ${className}`}
      aria-busy="true"
    >
      {message}
    </motion.p>
  );
}
