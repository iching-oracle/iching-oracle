"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHaptic } from "@/hooks/use-haptic";
import { castTotalMs, GUIDED_TIMING } from "@/lib/guided-reading/timing";
import { gentleEase } from "@/lib/guided-reading/motion";
import { RitualAmbient } from "@/components/guided-reading/ritual-ambient";
import { CastingLine } from "@/components/guided-reading/casting-line";
import type { GuidedReadingResult } from "@/types/guided-reading";

type CastingCeremonyProps = {
  question: string;
  fetchReading: () => Promise<GuidedReadingResult>;
  onComplete: (result: GuidedReadingResult) => void;
  onError: (message: string) => void;
};

export function CastingCeremony({
  question,
  fetchReading,
  onComplete,
  onError,
}: CastingCeremonyProps) {
  const reduced = useReducedMotion();
  const { pulse } = useHaptic();
  const [linesRevealed, setLinesRevealed] = useState(0);
  const [lineValues, setLineValues] = useState<number[] | null>(null);
  const [phase, setPhase] = useState<"toss" | "stillness" | "done">("toss");
  const resultRef = useRef<GuidedReadingResult | null>(null);
  const linesRef = useRef(0);
  const startedRef = useRef(false);

  const lineMs = reduced ? 280 : GUIDED_TIMING.castLineMs;
  const betweenMs = reduced ? 80 : GUIDED_TIMING.castBetweenMs;

  const tryFinish = useCallback(() => {
    if (!resultRef.current || linesRef.current < 6) return;
    setPhase("done");
    pulse([8, 40, 8]);
    onComplete(resultRef.current);
  }, [onComplete, pulse]);

  useEffect(() => {
    linesRef.current = linesRevealed;
    if (linesRevealed >= 6 && resultRef.current) {
      tryFinish();
    }
  }, [linesRevealed, tryFinish]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    fetchReading()
      .then((result) => {
        resultRef.current = result;
        setLineValues(result.lineValues);
        tryFinish();
      })
      .catch((err) => {
        onError(
          err instanceof Error ? err.message : "The casting could not complete.",
        );
      });
  }, [fetchReading, onError, tryFinish]);

  useEffect(() => {
    if (linesRevealed >= 6) {
      setPhase("stillness");
      pulse(10);
      tryFinish();
      return;
    }

    const t = window.setTimeout(() => {
      setLinesRevealed((n) => n + 1);
      pulse(6);
    }, lineMs + (linesRevealed > 0 ? betweenMs : 0));

    return () => window.clearTimeout(t);
  }, [linesRevealed, lineMs, betweenMs, pulse, tryFinish]);

  useEffect(() => {
    if (linesRevealed < 6) return;
    const t = window.setTimeout(tryFinish, reduced ? 200 : 600);
    return () => window.clearTimeout(t);
  }, [linesRevealed, tryFinish, reduced]);

  const totalMs = castTotalMs(!!reduced);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={gentleEase}
      className="relative flex min-h-[calc(100dvh-4.5rem)] flex-col items-center justify-center px-6 py-12"
      aria-label="Casting ceremony"
      aria-busy={phase !== "done"}
    >
      <RitualAmbient />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold/70">
          Casting
        </p>
        <h2 className="mt-3 font-serif text-xl text-foreground sm:text-2xl">
          The coins are falling
        </h2>
        <p className="mt-2 line-clamp-2 text-sm text-zen-muted italic">
          &ldquo;{question}&rdquo;
        </p>

        <motion.div
          className="relative my-12 flex h-24 w-24 items-center justify-center"
          animate={
            reduced
              ? undefined
              : {
                  rotate: [0, 180, 360],
                  scale: [1, 1.05, 1],
                }
          }
          transition={{
            duration: 3,
            repeat: phase === "toss" ? Infinity : 0,
            ease: "easeInOut",
          }}
          aria-hidden
        >
          <div className="absolute inset-0 rounded-full bg-amber-gold/20 blur-2xl" />
          <div className="relative flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-10 w-10 rounded-full border border-amber-gold/40 bg-gradient-to-br from-amber-gold/30 to-zen-surface shadow-lg"
                animate={
                  reduced
                    ? undefined
                    : { y: [0, -8, 0], opacity: [0.7, 1, 0.7] }
                }
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        </motion.div>

        <div
          className="flex w-full flex-col-reverse gap-4"
          role="list"
          aria-label="Hexagram lines forming, bottom to top"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <CastingLine
              key={i}
              index={i}
              revealed={i < linesRevealed}
              value={
                lineValues && i < linesRevealed ? lineValues[i]! : null
              }
            />
          ))}
        </div>

        <p className="mt-10 text-xs text-zen-muted">
          {phase === "stillness"
            ? "Hold stillness…"
            : `Line ${Math.min(linesRevealed + 1, 6)} of 6`}
        </p>

        <div
          className="mt-6 h-0.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={linesRevealed}
          aria-valuemin={0}
          aria-valuemax={6}
        >
          <motion.div
            className="h-full bg-amber-gold/60"
            initial={{ width: 0 }}
            animate={{ width: `${(linesRevealed / 6) * 100}%` }}
            transition={{ duration: lineMs / 1000 }}
          />
        </div>

        <p className="sr-only">
          Ceremony duration approximately {Math.round(totalMs / 1000)} seconds
        </p>
      </div>
    </motion.section>
  );
}
