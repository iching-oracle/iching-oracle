"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { InterpretationSection } from "@/components/interpretation/InterpretationSection";
import { ToneModeSelector } from "@/components/interpretation/ToneModeSelector";
import { parseInterpretationSections } from "@/lib/interpretation/parse";
import type {
  InterpretationMode,
  InterpretationSection as SectionType,
} from "@/types/interpretation";

type InterpretationCardProps = {
  readingId: string;
  initialRaw: string;
  initialMode?: InterpretationMode;
  canStream: boolean;
  onRegenerate: (mode: InterpretationMode) => Promise<void>;
  isStreaming: boolean;
  streamRaw: string;
  error: string | null;
};

export function InterpretationCard({
  readingId,
  initialRaw,
  initialMode = "traditional",
  canStream,
  onRegenerate,
  isStreaming,
  streamRaw,
  error,
}: InterpretationCardProps) {
  const [mode, setMode] = useState<InterpretationMode>(initialMode);
  const [copied, setCopied] = useState(false);

  const displayRaw = isStreaming ? streamRaw : initialRaw || streamRaw;

  const parsed = useMemo(
    () => parseInterpretationSections(displayRaw, mode),
    [displayRaw, mode],
  );

  const visibleSections = useMemo(() => {
    if (!isStreaming) return parsed.sections;

    const result: SectionType[] = [];
    for (const section of parsed.sections) {
      if (section.content.trim()) {
        result.push(section);
      }
    }
    const last = parsed.sections[parsed.sections.length - 1];
    if (
      last &&
      !result.find((s) => s.id === last.id) &&
      streamRaw.includes(`## ${last.title}`)
    ) {
      result.push({ ...last, content: last.content || "" });
    }
    return result;
  }, [isStreaming, parsed.sections, streamRaw]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(displayRaw);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [displayRaw]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/reading/${readingId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "I Ching Oracle Reading",
          text: parsed.sections[0]?.content.slice(0, 200) ?? "My oracle reading",
          url,
        });
      } catch {
        await handleCopy();
      }
    } else {
      await handleCopy();
    }
  }, [readingId, parsed.sections, handleCopy]);

  return (
    <div className="relative space-y-6">
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_55%)]"
        aria-hidden
      />

      <ToneModeSelector
        value={mode}
        onChange={setMode}
        disabled={isStreaming}
      />

      <div className="flex flex-wrap gap-2">
        {canStream ? (
          <button
            type="button"
            onClick={() => onRegenerate(mode)}
            disabled={isStreaming}
            className="auth-btn-secondary text-xs disabled:opacity-50"
          >
            {isStreaming ? "Channeling…" : "Regenerate interpretation"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleCopy}
          disabled={!displayRaw.trim()}
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zen-muted transition-colors hover:border-amber-gold/40 hover:text-amber-gold disabled:opacity-40"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          onClick={handleShare}
          disabled={!displayRaw.trim()}
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zen-muted transition-colors hover:border-amber-gold/40 hover:text-amber-gold disabled:opacity-40"
        >
          Share
        </button>
      </div>

      {error ? (
        <p
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {isStreaming && visibleSections.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 rounded-xl border border-amber-gold/20 bg-amber-gold/5 px-4 py-6"
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-gold/60 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-gold" />
          </span>
          <p className="text-sm text-amber-glow">
            The oracle is composing your reading…
          </p>
        </motion.div>
      ) : null}

      <div className="space-y-4">
        {visibleSections.map((section, index) => (
          <InterpretationSection
            key={section.id}
            section={section}
            index={index}
            isStreaming={
              isStreaming && index === visibleSections.length - 1
            }
          />
        ))}
      </div>
    </div>
  );
}
