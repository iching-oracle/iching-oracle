"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewReadingForm() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = (await res.json()) as {
        error?: string;
        reading?: { id: string };
      };

      if (!res.ok) {
        setError(data.error ?? "Failed to create reading");
        return;
      }

      if (data.reading?.id) {
        router.push(`/history/${data.reading.id}`);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="question" className="auth-label">
          Your question
        </label>
        <p className="mb-3 text-xs leading-relaxed text-zen-muted">
          心誠則靈 — phrase your question clearly. The oracle casts three coins
          six times on your behalf.
        </p>
        <textarea
          id="question"
          name="question"
          required
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="auth-input resize-none"
          placeholder="What guidance do you seek?"
          maxLength={500}
        />
        <p className="mt-1 text-right text-xs text-zen-muted/70">
          {question.length}/500
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="auth-btn-primary w-full"
      >
        {isLoading ? "Casting the hexagram…" : "Cast & Interpret"}
      </button>
    </form>
  );
}
