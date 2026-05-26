"use client";

import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1.5 px-4 py-3"
      role="status"
      aria-label="Oracle is reflecting"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-amber-gold/70"
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
