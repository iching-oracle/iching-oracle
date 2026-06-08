"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GuidedPremiumGate } from "@/components/guided-reading/guided-premium-gate";
import { RitualAmbient } from "@/components/guided-reading/ritual-ambient";
import { useSimulatedStream } from "@/hooks/use-simulated-stream";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { mapInterpretationToDisplaySections } from "@/lib/guided-reading/sections";
import { gentleEase, staggerContainer, fadeUp } from "@/lib/guided-reading/motion";
import {
  isAdvancedInterpretation,
  parseInterpretationSections,
  serializeInterpretation,
} from "@/lib/interpretation/parse";
import type { GuidedReadingResult } from "@/types/guided-reading";

type StreamingReadingProps = {
  result: GuidedReadingResult;
  onShare: () => void;
};

export function StreamingReading({ result, onShare }: StreamingReadingProps) {
  const reduced = useReducedMotion();
  const [interpretation, setInterpretation] = useState(result.interpretation);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sections = useMemo(
    () => mapInterpretationToDisplaySections(interpretation, result.isPremium),
    [interpretation, result.isPremium],
  );

  const shouldLiveStream =
    result.isPremium &&
    (result.interpretationPending ||
      !isAdvancedInterpretation(result.interpretation));

  useEffect(() => {
    if (!shouldLiveStream) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLiveStreaming(true);
    setInterpretation("");

    void (async () => {
      try {
        const response = await fetch("/api/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ readingId: result.readingId, mode: "traditional" }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error ?? "Interpretation failed");
        }
        if (!response.body) throw new Error("No stream");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setInterpretation(acc);
        }

        const parsed = parseInterpretationSections(acc, "traditional");
        const serialized = serializeInterpretation(parsed);
        setInterpretation(serialized);

        await fetch(`/api/readings/${result.readingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interpretation: serialized,
            interpretationMode: "traditional",
          }),
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Could not load reading.");
        setInterpretation(result.interpretation);
      } finally {
        setIsLiveStreaming(false);
      }
    })();

    return () => controller.abort();
  }, [shouldLiveStream, result.readingId, result.interpretation]);

  const copyAll = useCallback(async () => {
    const text = sections
      .filter((s) => !s.premiumOnly && s.content)
      .map((s) => `## ${s.title}\n\n${s.content}`)
      .join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [sections]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-[calc(100dvh-4.5rem)] px-4 py-10 sm:px-6 sm:py-14"
      aria-label="Oracle interpretation"
    >
      <RitualAmbient />

      <div className="relative z-10 mx-auto max-w-2xl">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold/80">
          Your reading
        </p>
        <h2 className="mt-2 font-serif text-2xl text-foreground">
          {result.primaryTitle}
        </h2>
        <p className="mt-1 text-sm text-zen-muted italic line-clamp-2">
          &ldquo;{result.question}&rdquo;
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        {isLiveStreaming && !interpretation.trim() && (
          <div className="mt-12 flex flex-col items-center gap-4" aria-busy>
            <motion.div
              className="h-1 w-24 rounded-full bg-amber-gold/30"
              animate={{ scaleX: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <p className="text-sm text-zen-muted">
              Observing the changing lines…
            </p>
          </div>
        )}

        {isLiveStreaming && interpretation.trim() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10 rounded-2xl border border-white/10 bg-zen-surface/40 p-6"
          >
            <h3 className="font-serif text-lg text-amber-gold/90">
              Receiving…
            </h3>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
              {interpretation}
            </p>
          </motion.div>
        )}

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mt-10 space-y-10"
        >
          {!isLiveStreaming &&
            sections.map((section) =>
              section.premiumOnly ? (
                <GuidedPremiumGate
                  key={section.id}
                  title={section.title}
                  teaser={
                    section.id.includes("pattern")
                      ? "See recurring themes across your journey."
                      : section.id.includes("trajectory")
                        ? "Sense where this energy may lead."
                        : "Understand the feeling beneath the symbols."
                  }
                />
              ) : (
                <ReadingSectionBlock
                  key={section.id}
                  title={section.title}
                  content={section.content}
                  simulate={!reduced}
                />
              ),
            )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, ...gentleEase }}
          className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-10 sm:flex-row sm:flex-wrap"
        >
          <Link
            href={`/history/${result.readingId}`}
            className="auth-btn-primary text-center text-sm"
          >
            Save to journal
          </Link>
          <Link
            href="/oracle/chat"
            className="rounded-full border border-white/15 px-6 py-3 text-center text-sm text-foreground transition-colors hover:border-amber-gold/40"
          >
            Continue conversation
          </Link>
          <button
            type="button"
            onClick={() => void copyAll()}
            className="rounded-full border border-white/15 px-6 py-3 text-sm text-zen-muted hover:text-foreground"
          >
            {copied ? "Copied" : "Copy reading"}
          </button>
          <button
            type="button"
            onClick={onShare}
            className="rounded-full border border-amber-gold/30 bg-amber-gold/10 px-6 py-3 text-sm text-amber-gold"
          >
            Share
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}

function ReadingSectionBlock({
  title,
  content,
  simulate,
}: {
  title: string;
  content: string;
  simulate: boolean;
}) {
  const streamed = useSimulatedStream(
    content,
    simulate && !!content.trim(),
    6,
    20,
  );

  if (!content.trim()) return null;

  return (
    <motion.article variants={fadeUp} className="space-y-3">
      <h3 className="font-serif text-lg text-amber-gold/90">{title}</h3>
      <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
        {streamed}
        {simulate && streamed.length < content.length && (
          <span className="inline-block w-0.5 animate-pulse bg-amber-gold/60" />
        )}
      </p>
    </motion.article>
  );
}
