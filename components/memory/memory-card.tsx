"use client";

import { motion } from "framer-motion";
import { MEMORY_TYPE_LABELS } from "@/lib/memory/constants";
import type { MemoryType } from "@/types/memory";
import { formatDate } from "@/lib/format-date";
import type { MemoryDTO } from "@/types/memory";

type MemoryCardProps = {
  memory: MemoryDTO;
  onDelete?: (id: string) => void;
  deleting?: boolean;
};

export function MemoryCard({ memory, onDelete, deleting }: MemoryCardProps) {
  const label =
    MEMORY_TYPE_LABELS[memory.type as MemoryType] ?? memory.type;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zen-surface/70 p-5 backdrop-blur-xl transition-shadow hover:border-amber-gold/25 hover:shadow-[0_0_32px_-12px_rgba(197,160,89,0.25)]"
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-cosmic-purple/15 blur-2xl transition-opacity group-hover:opacity-100 opacity-60"
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-amber-gold">
          {label}
        </p>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-zen-muted">
          {Math.round(memory.confidence * 100)}% confidence
        </span>
      </div>
      <p className="relative mt-3 text-sm leading-relaxed text-foreground">
        {memory.summary}
      </p>
      {memory.tags.length > 0 ? (
        <div className="relative mt-3 flex flex-wrap gap-1.5">
          {memory.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-zen-bg/50 px-2 py-0.5 text-[10px] text-zen-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <div className="relative mt-4 flex items-center justify-between text-[10px] text-zen-muted">
        <span>
          Referenced{" "}
          {memory.lastReferencedAt
            ? formatDate(memory.lastReferencedAt, "en-US")
            : "not yet"}
        </span>
        <span>×{memory.occurrenceCount}</span>
      </div>
      {onDelete ? (
        <button
          type="button"
          onClick={() => onDelete(memory.id)}
          disabled={deleting}
          className="relative mt-3 text-[10px] uppercase tracking-widest text-zen-muted hover:text-red-300 disabled:opacity-50"
        >
          Remove memory
        </button>
      ) : null}
    </motion.article>
  );
}
