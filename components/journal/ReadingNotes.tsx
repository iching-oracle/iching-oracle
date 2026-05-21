"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type ReadingNotesProps = {
  readingId: string;
  initialNotes: string | null;
};

export function ReadingNotes({ readingId, initialNotes }: ReadingNotesProps) {
  const [value, setValue] = useState(initialNotes ?? "");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(initialNotes ?? "");

  const saveNotes = useCallback(
    async (notes: string) => {
      if (notes === lastSavedRef.current) return;

      setStatus("saving");
      try {
        const res = await fetch("/api/history/notes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ readingId, notes }),
        });

        if (!res.ok) {
          setStatus("error");
          return;
        }

        const data = (await res.json()) as { notes: string | null };
        const saved = data.notes ?? "";
        lastSavedRef.current = saved;
        setValue(saved);
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } catch {
        setStatus("error");
      }
    },
    [readingId],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      void saveNotes(value);
    }, 700);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, saveNotes]);

  const statusLabel =
    status === "saving"
      ? "Saving…"
      : status === "saved"
        ? "Saved"
        : status === "error"
          ? "Could not save"
          : value.trim() !== lastSavedRef.current
            ? "Unsaved changes"
            : "";

  return (
    <section className="rounded-2xl border border-white/10 bg-zen-surface/70 p-6 backdrop-blur-xl sm:p-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xs font-medium uppercase tracking-widest text-amber-gold">
          Personal notes
        </h2>
        <span
          className={`text-[10px] uppercase tracking-wider ${
            status === "error"
              ? "text-red-300"
              : status === "saved"
                ? "text-amber-glow"
                : "text-zen-muted"
          }`}
          aria-live="polite"
        >
          {statusLabel}
        </span>
      </div>
      <p className="mb-3 text-xs text-zen-muted">
        Private reflections only you can see. Changes save automatically.
      </p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={5}
        maxLength={5000}
        placeholder="What resonated with you? What will you carry forward from this reading?"
        className="auth-input min-h-[120px] w-full resize-y font-serif text-sm leading-relaxed"
      />
    </section>
  );
}
