"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { InterpretationCard } from "@/components/interpretation/InterpretationCard";
import {
  isAdvancedInterpretation,
  parseInterpretationSections,
  serializeInterpretation,
} from "@/lib/interpretation/parse";
import type { InterpretationMode } from "@/types/interpretation";

type AIInsightPanelProps = {
  readingId: string;
  savedInterpretation: string;
  interpretationPending: boolean;
  isPremiumReading: boolean;
  autoStream?: boolean;
};

export function AIInsightPanel({
  readingId,
  savedInterpretation,
  interpretationPending,
  isPremiumReading,
  autoStream = false,
}: AIInsightPanelProps) {
  const [mode, setMode] = useState<InterpretationMode>("traditional");
  const [raw, setRaw] = useState(savedInterpretation);
  const [streamRaw, setStreamRaw] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const hasStructured = isAdvancedInterpretation(savedInterpretation);
  const shouldAutoStream =
    autoStream &&
    (interpretationPending ||
      !isPremiumReading ||
      !hasStructured ||
      !savedInterpretation.trim());

  const saveInterpretation = useCallback(
    async (text: string) => {
      await fetch(`/api/readings/${readingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interpretation: text, interpretationMode: mode }),
      });
      setRaw(text);
    },
    [readingId, mode],
  );

  const runStream = useCallback(
    async (selectedMode: InterpretationMode) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setMode(selectedMode);
      setIsStreaming(true);
      setStreamRaw("");
      setError(null);

      try {
        const response = await fetch("/api/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ readingId, mode: selectedMode }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error ?? "Stream failed");
        }

        if (!response.body) {
          throw new Error("No stream body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setStreamRaw(accumulated);
        }

        const parsed = parseInterpretationSections(accumulated, selectedMode);
        const serialized = serializeInterpretation(parsed);
        await saveInterpretation(serialized);
        setStreamRaw("");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "Interpretation failed.",
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [readingId, saveInterpretation],
  );

  useEffect(() => {
    if (shouldAutoStream) {
      void runStream("traditional");
    }
    return () => abortRef.current?.abort();
  }, [shouldAutoStream, runStream]);

  return (
    <div className="space-y-8">
      <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-zen-surface/90 via-zen-elevated/50 to-zen-bg/90 p-5 shadow-[0_0_60px_-20px_rgba(139,92,246,0.35)] backdrop-blur-xl sm:p-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-gold/50 to-transparent"
          aria-hidden
        />
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.28em] text-amber-gold">
          Oracle Insight
        </p>

        <InterpretationCard
          readingId={readingId}
          initialRaw={isStreaming ? streamRaw : raw}
          initialMode={mode}
          canStream
          onRegenerate={runStream}
          isStreaming={isStreaming}
          streamRaw={streamRaw}
          error={error}
        />
      </div>
    </div>
  );
}
