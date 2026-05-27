"use client";

import { motion, useReducedMotion } from "framer-motion";
import { memo } from "react";

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 11) % 100}%`,
  top: `${(i * 23 + 7) % 100}%`,
  size: 2 + (i % 3),
  delay: (i % 5) * 0.8,
}));

export const RitualAmbient = memo(function RitualAmbient() {
  const reduced = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <motion.div
        className="absolute inset-0"
        animate={
          reduced
            ? undefined
            : {
                opacity: [0.5, 0.75, 0.5],
              }
        }
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(197,160,89,0.12) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 20% 80%, rgba(139,92,246,0.1) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 85% 40%, rgba(197,160,89,0.06) 0%, transparent 45%)",
        }}
      />
      <div className="absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-cosmic-purple/15 blur-[100px]" />
      <div className="absolute -right-24 bottom-1/3 h-72 w-72 rounded-full bg-amber-gold/10 blur-[90px]" />

      {!reduced &&
        PARTICLES.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-amber-gold/30"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -12, 0],
              opacity: [0.15, 0.45, 0.15],
            }}
            transition={{
              duration: 4 + (p.id % 3),
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
    </div>
  );
});
