"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { GUIDED_TIMING } from "@/lib/guided-reading/timing";
import { gentleEase, fadeUp } from "@/lib/guided-reading/motion";
import { RitualAmbient } from "@/components/guided-reading/ritual-ambient";

const LINES = [
  "Take a breath.",
  "Quiet your thoughts.",
  "Focus on the question that truly matters.",
] as const;

const FINAL_LINE = "The oracle is ready.";

type RitualIntroProps = {
  onBegin: () => void;
};

export function RitualIntro({ onBegin }: RitualIntroProps) {
  const reduced = useReducedMotion();
  const [lineIndex, setLineIndex] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const lineMs = reduced ? 400 : GUIDED_TIMING.welcomeLineMs;
  const pauseMs = reduced ? 200 : GUIDED_TIMING.welcomePauseMs;

  useEffect(() => {
    if (lineIndex < LINES.length - 1) {
      const t = window.setTimeout(
        () => setLineIndex((i) => i + 1),
        lineMs + pauseMs,
      );
      return () => window.clearTimeout(t);
    }
    if (!showFinal) {
      const t = window.setTimeout(() => setShowFinal(true), lineMs);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(
      () => setShowButton(true),
      lineMs + pauseMs,
    );
    return () => window.clearTimeout(t);
  }, [lineIndex, showFinal, lineMs, pauseMs]);

  const currentLine = showFinal ? FINAL_LINE : LINES[lineIndex];

  return (
    <motion.section
      variants={fadeUp}
      initial="initial"
      animate="animate"
      exit={{ opacity: 0 }}
      transition={gentleEase}
      className="relative flex min-h-[calc(100dvh-4.5rem)] flex-col items-center justify-center px-6 py-16"
      aria-label="Welcome ritual"
    >
      <RitualAmbient />

      <div className="relative z-10 flex max-w-md flex-col items-center text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-amber-gold/80">
          I Ching Oracle
        </p>

        <div
          className="mt-16 flex min-h-[5rem] items-center justify-center"
          aria-live="polite"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={currentLine}
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={gentleEase}
              className="font-serif text-2xl leading-relaxed text-foreground sm:text-3xl"
            >
              {currentLine}
            </motion.p>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showButton && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...gentleEase, delay: 0.2 }}
              onClick={onBegin}
              className="auth-btn-primary mt-20 min-w-[200px] px-10 py-3.5 text-sm tracking-wide"
            >
              Begin
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
