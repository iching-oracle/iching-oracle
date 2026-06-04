"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OracleMilestoneDTO } from "@/types/insights";

type MilestonePanelProps = {
  milestones: OracleMilestoneDTO[];
  isPremium: boolean;
};

export function MilestonePanel({ milestones, isPremium }: MilestonePanelProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isPremium) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/insights/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), note: note.trim() || undefined }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Could not save");
      }
      setTitle("");
      setNote("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-zen-surface/60 p-6">
      <h2 className="text-xs font-medium uppercase tracking-widest text-amber-gold">
        Oracle milestones
      </h2>
      <p className="mt-2 text-sm text-zen-muted">
        Mark moments that matter — turning points, insights, or emotional anchors.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="block">
          <span className="sr-only">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A title for this moment"
            maxLength={120}
            className="w-full rounded-lg border border-white/10 bg-zen-bg/80 px-3 py-2 text-sm text-foreground"
          />
        </label>
        <label className="block">
          <span className="sr-only">Note</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note (private)"
            rows={2}
            maxLength={500}
            className="w-full rounded-lg border border-white/10 bg-zen-bg/80 px-3 py-2 text-sm text-foreground"
          />
        </label>
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={pending || !title.trim()}
          className="auth-btn-secondary text-sm disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save milestone"}
        </button>
      </form>

      {milestones.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {milestones.slice(0, 5).map((m) => (
            <li
              key={m.id}
              className="rounded-lg border border-white/8 bg-zen-elevated/40 px-3 py-2"
            >
              <p className="text-sm font-medium text-foreground/90">{m.title}</p>
              {m.note ? (
                <p className="mt-1 text-xs text-zen-muted line-clamp-2">{m.note}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
