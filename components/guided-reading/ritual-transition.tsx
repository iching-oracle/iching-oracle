"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { HexagramDisplay } from "@/components/HexagramDisplay";
import { useHaptic } from "@/hooks/use-haptic";
import { ritualDurationMs, GUIDED_TIMING } from "@/lib/guided-reading/timing";
import { gentleEase } from "@/lib/guided-reading/motion";
import type { GuidedReadingResult } from "@/types/guided-reading";

const SYMBOLS = ["☰", "☷", "☵", "☲", "☳", "☴", "☶", "☱"];

type RitualTransitionProps = {
  question: string;
  fetchReading: () => Promise<GuidedReadingResult>;
  onComplete: (result: GuidedReadingResult) => void;
  onError: (message: string) => void;
};

export function RitualTransition({
  question,
  fetchReading,
  onComplete,
  onError,
}: RitualTransitionProps) {
  const reduced = useReducedMotion();
  const { pulse } = useHaptic();
  const [phase, setPhase] = useState<"darken" | "consult" | "reveal" | "done">(
    "darken",
  );
  const [result, setResult] = useState<GuidedReadingResult | null>(null);
  const startedRef = useRef(false);
  const doneRef = useRef(false);
  const startTimeRef = useRef(0);

  const minMs = ritualDurationMs(!!reduced);

  const finish = useCallback(
    (data: GuidedReadingResult) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setPhase("done");
      pulse([10, 30, 10]);
      onComplete(data);
    },
    [onComplete, pulse],
  );

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startTimeRef.current = Date.now();

    const darkenT = window.setTimeout(
      () => setPhase("consult"),
      reduced ? 100 : GUIDED_TIMING.ritualFadeMs,
    );

    fetchReading()
      .then((data) => {
        setResult(data);
        const elapsed = Date.now() - startTimeRef.current;
        const wait = Math.max(0, minMs - elapsed);

        window.setTimeout(() => {
          setPhase("reveal");
          pulse(8);
          window.setTimeout(() => finish(data), reduced ? 400 : 900);
        }, wait);
      })
      .catch((err) => {
        onError(
          err instanceof Error ? err.message : "The oracle could not respond.",
        );
      });

    return () => window.clearTimeout(darkenT);
  }, [fetchReading, finish, minMs, onError, pulse, reduced]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex min-h-[100dvh] items-center justify-center bg-black/85 px-6"
      aria-live="polite"
      aria-busy={phase !== "done"}
      aria-label="Consulting the oracle"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cosmic-deep/40 via-transparent to-amber-gold/5"
        aria-hidden
      />

      {!reduced &&
        SYMBOLS.map((sym, i) => (
          <motion.span
            key={sym}
            className="pointer-events-none absolute text-2xl text-amber-gold/20"
            style={{
              left: `${15 + (i * 11) % 70}%`,
              top: `${20 + (i * 13) % 60}%`,
            }}
            animate={{
              y: [0, -16, 0],
              opacity: [0.1, 0.35, 0.1],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: i * 0.2,
            }}
            aria-hidden
          >
            {sym}
          </motion.span>
        ))}

      <div className="relative z-10 flex max-w-md flex-col items-center text-center">
        {phase === "reveal" && result ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={gentleEase}
          >
            <HexagramDisplay
              hexagramNumber={result.hexagram}
              size="lg"
              animated={!reduced}
            />
          </motion.div>
        ) : (
          <motion.div
            className="relative flex h-28 w-28 items-center justify-center"
            animate={
              reduced
                ? undefined
                : {
                    scale: [1, 1.06, 1],
                  }
            }
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-amber-gold/25 blur-2xl"
              animate={
                reduced
                  ? undefined
                  : { opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }
              }
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative h-3 w-3 rounded-full bg-amber-gold shadow-[0_0_24px_rgba(251,191,36,0.8)]" />
          </motion.div>
        )}

        <motion.h2
          key={phase}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 font-serif text-2xl text-foreground sm:text-3xl"
        >
          {phase === "reveal"
            ? result?.primaryTitle ?? "Your hexagram"
            : "Consulting the Oracle…"}
        </motion.h2>

        <p className="mt-3 line-clamp-2 max-w-sm text-sm italic text-zen-muted">
          &ldquo;{question}&rdquo;
        </p>
      </div>
    </motion.div>
  );
}
