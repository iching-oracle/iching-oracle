"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { HexagramDisplay } from "@/components/HexagramDisplay";
import { GUIDED_TIMING } from "@/lib/guided-reading/timing";
import { gentleEase } from "@/lib/guided-reading/motion";
import { RitualAmbient } from "@/components/guided-reading/ritual-ambient";
import type { GuidedReadingResult } from "@/types/guided-reading";

type RevealPhase =
  | "symbol"
  | "lines"
  | "number"
  | "chinese"
  | "english"
  | "phrase"
  | "done";

type HexagramRevealProps = {
  result: GuidedReadingResult;
  onContinue: () => void;
};

export function HexagramReveal({ result, onContinue }: HexagramRevealProps) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<RevealPhase>("symbol");

  const stagger = reduced ? 120 : GUIDED_TIMING.revealMetaStaggerMs;

  useEffect(() => {
    const order: RevealPhase[] = [
      "symbol",
      "lines",
      "number",
      "chinese",
      "english",
      "phrase",
      "done",
    ];
    const idx = order.indexOf(phase);
    if (idx < 0 || idx >= order.length - 1) return;

    const delay =
      phase === "symbol"
        ? reduced
          ? 200
          : GUIDED_TIMING.revealSymbolMs
        : phase === "lines"
          ? reduced
            ? 300
            : GUIDED_TIMING.revealLineStaggerMs * 6 + 400
          : stagger;

    const t = window.setTimeout(() => {
      setPhase(order[idx + 1]!);
    }, delay);

    return () => window.clearTimeout(t);
  }, [phase, stagger, reduced]);

  useEffect(() => {
    if (phase !== "done") return;
    const t = window.setTimeout(onContinue, reduced ? 400 : 1200);
    return () => window.clearTimeout(t);
  }, [phase, onContinue, reduced]);

  const showLines = ["lines", "number", "chinese", "english", "phrase", "done"].includes(
    phase,
  );
  const showNumber = ["number", "chinese", "english", "phrase", "done"].includes(
    phase,
  );
  const showChinese = ["chinese", "english", "phrase", "done"].includes(phase);
  const showEnglish = ["english", "phrase", "done"].includes(phase);
  const showPhrase = ["phrase", "done"].includes(phase);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={gentleEase}
      className="relative flex min-h-[calc(100dvh-4.5rem)] flex-col items-center justify-center px-6 py-16"
      aria-label="Hexagram reveal"
    >
      <RitualAmbient />

      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, filter: "blur(12px)" }}
          animate={{
            opacity: phase === "symbol" ? 1 : showLines ? 1 : 0.6,
            scale: 1,
            filter: "blur(0px)",
          }}
          transition={gentleEase}
          className="mb-8"
        >
          <motion.div
            animate={
              reduced
                ? undefined
                : {
                    boxShadow: [
                      "0 0 40px rgba(251,191,36,0.2)",
                      "0 0 80px rgba(251,191,36,0.35)",
                      "0 0 40px rgba(251,191,36,0.2)",
                    ],
                  }
            }
            transition={{ duration: 3, repeat: Infinity }}
            className="rounded-full p-6"
          >
            {showLines ? (
              <HexagramDisplay
                hexagramNumber={result.hexagram}
                size="lg"
                animated={!reduced}
              />
            ) : (
              <div
                className="flex h-[180px] w-[180px] items-center justify-center font-serif text-6xl text-amber-gold/40"
                aria-hidden
              >
                ☰
              </div>
            )}
          </motion.div>
        </motion.div>

        {showNumber && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-medium uppercase tracking-[0.4em] text-amber-gold"
          >
            Hexagram {result.hexagram}
          </motion.p>
        )}

        {showChinese && (
          <motion.p
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            className="mt-4 font-serif text-5xl text-foreground"
          >
            {result.chineseName}
          </motion.p>
        )}

        {showEnglish && (
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 font-serif text-2xl text-foreground sm:text-3xl"
          >
            {result.primaryTitle}
          </motion.h2>
        )}

        {showPhrase && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, ...gentleEase }}
            className="mt-6 max-w-md text-sm leading-relaxed text-zen-muted italic"
          >
            {result.judgment}
          </motion.p>
        )}

        {phase === "done" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10 text-xs text-zen-muted"
          >
            Receiving your interpretation…
          </motion.p>
        )}
      </div>
    </motion.section>
  );
}
