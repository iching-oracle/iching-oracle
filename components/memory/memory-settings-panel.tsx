"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { MemoryCard } from "@/components/memory/memory-card";
import { MemoryTimeline } from "@/components/memory/memory-timeline";
import type { MemoryDTO, MemorySettingsDTO, MemoryTimelineEntry } from "@/types/memory";

type MemorySettingsPanelProps = {
  initialMemories: MemoryDTO[];
  initialSettings: MemorySettingsDTO;
  initialTimeline: MemoryTimelineEntry[];
};

export function MemorySettingsPanel({
  initialMemories,
  initialSettings,
  initialTimeline,
}: MemorySettingsPanelProps) {
  const [memories, setMemories] = useState(initialMemories);
  const [settings, setSettings] = useState(initialSettings);
  const [timeline] = useState(initialTimeline);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/memory");
    if (!res.ok) return;
    const data = (await res.json()) as {
      memories: MemoryDTO[];
      settings: MemorySettingsDTO;
    };
    setMemories(data.memories);
    setSettings(data.settings);
  }, []);

  const toggleMemory = async () => {
    setBusy("toggle");
    const res = await fetch("/api/memory/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memoryEnabled: !settings.memoryEnabled }),
    });
    if (res.ok) {
      const next = (await res.json()) as MemorySettingsDTO;
      setSettings(next);
      setMessage(next.memoryEnabled ? "Memory enabled" : "Memory disabled");
    }
    setBusy(null);
  };

  const clearAll = async () => {
    if (!confirm("Clear all memories? This cannot be undone.")) return;
    setBusy("clear");
    await fetch("/api/memory/clear", { method: "POST" });
    setMemories([]);
    setMessage("All memories cleared");
    await refresh();
    setBusy(null);
  };

  const extractNow = async () => {
    setBusy("extract");
    const res = await fetch("/api/memory/extract", { method: "POST" });
    const data = (await res.json()) as {
      created?: number;
      updated?: number;
      skipped?: boolean;
      error?: string;
    };
    if (res.ok) {
      setMessage(
        data.skipped
          ? "Nothing new to extract right now"
          : `Updated journey (${data.created ?? 0} new, ${data.updated ?? 0} reinforced)`,
      );
      await refresh();
    } else {
      setMessage(data.error ?? "Extraction failed");
    }
    setBusy(null);
  };

  const deleteMemory = async (id: string) => {
    setBusy(id);
    await fetch(`/api/memory/${id}`, { method: "DELETE" });
    setMemories((prev) => prev.filter((m) => m.id !== id));
    setBusy(null);
  };

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-white/10 bg-zen-surface/70 p-6 backdrop-blur-xl sm:p-8">
        <h2 className="text-xs font-medium uppercase tracking-[0.3em] text-amber-gold">
          Privacy & control
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zen-muted">
          The oracle stores compressed themes — not full transcripts. You can
          review, delete, or disable memory at any time. Memories help the guide
          speak with continuity, not surveillance.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 px-4 py-3">
            <input
              type="checkbox"
              checked={settings.memoryEnabled}
              disabled={busy === "toggle"}
              onChange={() => void toggleMemory()}
            />
            <span className="text-sm">Enable companion memory</span>
          </label>
          <button
            type="button"
            onClick={() => void extractNow()}
            disabled={!settings.memoryEnabled || busy === "extract"}
            className="auth-btn-secondary text-sm disabled:opacity-50"
          >
            Refresh patterns
          </button>
          <button
            type="button"
            onClick={() => void clearAll()}
            disabled={memories.length === 0 || busy === "clear"}
            className="rounded-full border border-white/10 px-4 py-2 text-xs text-zen-muted hover:border-red-400/40 hover:text-red-300 disabled:opacity-40"
          >
            Clear all memory
          </button>
        </div>
        <p className="mt-4 text-xs text-zen-muted">
          {settings.isPremium ? (
            <>Premium: long-term memory & journey timeline.</>
          ) : (
            <>
              Free: up to {settings.memoryLimit} memories, {14}-day window.{" "}
              <Link href="/pricing" className="text-amber-gold hover:underline">
                Upgrade
              </Link>{" "}
              for full journey memory.
            </>
          )}
        </p>
        {message ? (
          <p className="mt-3 text-xs text-amber-gold/90">{message}</p>
        ) : null}
      </section>

      {settings.canUseTimeline && timeline.length > 0 ? (
        <section className="rounded-2xl border border-cosmic-violet/20 bg-zen-surface/50 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="font-serif text-xl text-foreground">Your journey</h2>
          <p className="mt-2 text-sm text-zen-muted">
            Recurring themes and transitions over time
          </p>
          <div className="mt-8">
            <MemoryTimeline entries={timeline} />
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="text-xs font-medium uppercase tracking-[0.3em] text-zen-muted">
          Saved memories ({memories.length}
          {settings.memoryLimit != null ? ` / ${settings.memoryLimit}` : ""})
        </h2>
        {!settings.memoryEnabled ? (
          <p className="mt-4 text-sm text-zen-muted">
            Memory is disabled. The oracle will not use or store new patterns.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {memories.length === 0 ? (
                <p className="text-sm text-zen-muted sm:col-span-2">
                  No memories yet. Reflect in{" "}
                  <Link href="/oracle/chat" className="text-amber-gold hover:underline">
                    Conversation Oracle
                  </Link>{" "}
                  or save readings — patterns will emerge gently over time.
                </p>
              ) : (
                memories.map((m) => (
                  <MemoryCard
                    key={m.id}
                    memory={m}
                    onDelete={deleteMemory}
                    deleting={busy === m.id}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}
