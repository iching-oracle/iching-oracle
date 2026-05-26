"use client";

import { useCallback, useState, useTransition } from "react";
import { regenerateReadingInterpretation } from "@/lib/actions/readings";

type ReadingDetailActionsProps = {
  readingId: string;
  interpretation: string;
};

export function ReadingDetailActions({
  readingId,
  interpretation,
}: ReadingDetailActionsProps) {
  const [copied, setCopied] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(interpretation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [interpretation]);

  function handleRegenerate() {
    startTransition(async () => {
      setRegenError(null);
      const result = await regenerateReadingInterpretation(readingId);
      if (result.error) {
        setRegenError(result.error);
        return;
      }
      window.location.reload();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zen-muted hover:border-amber-gold/40 hover:text-amber-gold"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <button
        type="button"
        onClick={handleRegenerate}
        disabled={isPending}
        className="auth-btn-secondary text-xs disabled:opacity-50"
      >
        {isPending ? "Regenerating…" : "Regenerate"}
      </button>
      {regenError ? (
        <p className="w-full text-xs text-red-300" role="alert">
          {regenError}
        </p>
      ) : null}
    </div>
  );
}
