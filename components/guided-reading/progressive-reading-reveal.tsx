"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { HexagramDisplay } from "@/components/HexagramDisplay";
import { GuidedPremiumGate } from "@/components/guided-reading/guided-premium-gate";
import { ReadingActionPanel } from "@/components/guided-reading/reading-action-panel";
import { RitualAmbient } from "@/components/guided-reading/ritual-ambient";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useSimulatedStream } from "@/hooks/use-simulated-stream";
import { buildProgressiveRevealBlocks } from "@/lib/guided-reading/reveal-blocks";
import { GUIDED_TIMING } from "@/lib/guided-reading/timing";
import { gentleEase } from "@/lib/guided-reading/motion";
import {
  isAdvancedInterpretation,
  parseInterpretationSections,
  serializeInterpretation,
} from "@/lib/interpretation/parse";
import type { GuidedReadingResult, RevealBlock } from "@/types/guided-reading";

type ProgressiveReadingRevealProps = {
  result: GuidedReadingResult;
  onShare: () => void;
  onNewReading: () => void;
};

export function ProgressiveReadingReveal({
  result,
  onShare,
  onNewReading,
}: ProgressiveReadingRevealProps) {
  const reduced = useReducedMotion();
  const [interpretation, setInterpretation] = useState(result.interpretation);
  const [visibleCount, setVisibleCount] = useState(reduced ? 99 : 0);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const blockDelay = reduced
    ? GUIDED_TIMING.revealBlockMsReduced
    : GUIDED_TIMING.revealBlockMs;

  const blocks = useMemo(
    () => buildProgressiveRevealBlocks(result, interpretation),
    [result, interpretation],
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
          body: JSON.stringify({
            readingId: result.readingId,
            mode: "traditional",
          }),
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
        setInterpretation(serializeInterpretation(parsed));

        await fetch(`/api/readings/${result.readingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interpretation: serializeInterpretation(parsed),
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
  }, [shouldLiveStream, result.readingId, result.interpretation, reduced]);

  useEffect(() => {
    if (shouldLiveStream) return;
    if (reduced) {
      setVisibleCount(blocks.length);
      return;
    }
    if (visibleCount >= blocks.length) return;

    const t = window.setTimeout(() => {
      setVisibleCount((c) => Math.min(c + 1, blocks.length));
    }, blockDelay);

    return () => window.clearTimeout(t);
  }, [visibleCount, blocks.length, blockDelay, shouldLiveStream, reduced]);

  useEffect(() => {
    if (!shouldLiveStream && blocks.length > 0 && visibleCount === 0) {
      setVisibleCount(1);
    }
  }, [blocks.length, shouldLiveStream, visibleCount]);

  useEffect(() => {
    if (!shouldLiveStream) return;
    const base = 2;
    if (reduced) {
      setVisibleCount(blocks.length);
      return;
    }
    setVisibleCount((c) => Math.max(c, base));
    if (!isLiveStreaming) {
      setVisibleCount((c) => Math.min(blocks.length, c + 1));
      return;
    }
    const extra = Math.floor(interpretation.length / 500);
    setVisibleCount((c) => Math.min(blocks.length, Math.max(c, base + extra)));
  }, [
    shouldLiveStream,
    blocks.length,
    interpretation.length,
    isLiveStreaming,
    reduced,
  ]);

  const visibleBlocks = blocks.slice(0, visibleCount);
  const showActions = visibleCount >= blocks.length && !isLiveStreaming;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-[calc(100dvh-4.5rem)] px-4 py-10 pb-24 sm:px-6 sm:py-14"
      aria-label="Your reading"
    >
      <RitualAmbient />

      <div className="relative z-10 mx-auto max-w-2xl">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-gold/80">
          Your reading
        </p>
        <p className="mt-2 line-clamp-2 text-sm italic text-zen-muted">
          &ldquo;{result.question}&rdquo;
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        {isLiveStreaming && (
          <p className="mt-8 text-center text-sm text-zen-muted" aria-busy>
            The oracle is speaking…
          </p>
        )}

        <div className="mt-8 space-y-8">
          {visibleBlocks.map((block, index) => (
            <RevealBlockView
              key={block.id}
              block={block}
              result={result}
              index={index}
              simulateText={!reduced && !isLiveStreaming}
            />
          ))}
        </div>

        {showActions && (
          <ReadingActionPanel
            readingId={result.readingId}
            onShare={onShare}
            onNewReading={onNewReading}
          />
        )}
      </div>
    </motion.section>
  );
}

function RevealBlockView({
  block,
  result,
  simulateText,
}: {
  block: RevealBlock;
  result: GuidedReadingResult;
  index: number;
  simulateText: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <BlockContent block={block} result={result} simulateText={simulateText} />
    </motion.div>
  );
}

function BlockContent({
  block,
  result,
  simulateText,
}: {
  block: RevealBlock;
  result: GuidedReadingResult;
  simulateText: boolean;
}) {
  if (block.type === "hexagram") {
    return (
      <div className="flex justify-center py-4">
        <div className="rounded-3xl border border-amber-gold/20 bg-zen-surface/40 p-8 backdrop-blur-xl">
          <HexagramDisplay hexagramNumber={result.hexagram} size="lg" animated />
        </div>
      </div>
    );
  }

  if (block.type === "hexagram-name") {
    return (
      <div className="text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-amber-gold">
          Hexagram {result.hexagram}
        </p>
        <p className="mt-3 font-serif text-5xl text-foreground">{result.chineseName}</p>
        <h2 className="mt-2 font-serif text-2xl text-foreground sm:text-3xl">
          {result.primaryTitle}
        </h2>
      </div>
    );
  }

  if ("premiumOnly" in block && block.premiumOnly) {
    return <GuidedPremiumGate title={block.title} />;
  }

  const title =
    block.type === "core-meaning"
      ? "Core Meaning"
      : block.type === "changing-lines"
        ? "Changing Lines"
        : block.type === "guidance"
          ? "Guidance"
          : block.type === "reflection"
            ? "Reflection"
            : block.type === "interpretation"
              ? block.title
              : "";

  const content = "content" in block ? block.content : "";

  return (
    <article className="rounded-2xl border border-white/10 bg-zen-surface/45 p-6 backdrop-blur-md sm:p-8">
      <h3 className="font-serif text-lg text-amber-gold/90">{title}</h3>
      <StreamedParagraph content={content} simulate={simulateText} />
    </article>
  );
}

function StreamedParagraph({
  content,
  simulate,
}: {
  content: string;
  simulate: boolean;
}) {
  const text = useSimulatedStream(content, simulate && content.length > 0, 8, 18);

  if (!content.trim()) return null;

  return (
    <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
      {simulate ? text : content}
      {simulate && text.length < content.length && (
        <span className="ml-0.5 inline-block w-0.5 animate-pulse bg-amber-gold/60" />
      )}
    </p>
  );
}
