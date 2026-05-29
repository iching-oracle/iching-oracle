"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { showSuccess } from "@/hooks/use-app-toast";

type BetaWaitlistFormProps = {
  source?: string;
  variant?: "hero" | "compact";
};

export function BetaWaitlistForm({
  source = "beta_landing",
  variant = "hero",
}: BetaWaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [referrer, setReferrer] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name.trim() || undefined,
          source,
          referrer: referrer.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        position?: number;
      };
      if (!res.ok) throw new Error(data.error ?? "Could not join waitlist");
      setDone(true);
      setPosition(data.position ?? null);
      showSuccess(data.message ?? "You're on the list.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-amber-gold/25 bg-amber-gold/10 px-6 py-5 text-center"
      >
        <p className="font-serif text-lg text-foreground">You are on the list.</p>
        <p className="mt-2 text-sm text-zen-muted">
          We will reach out personally when your invite is ready.
          {position ? ` Place #${position}.` : ""}
        </p>
      </motion.div>
    );
  }

  const isCompact = variant === "compact";

  return (
    <form onSubmit={submit} className="space-y-3">
      {!isCompact ? (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (optional)"
          className="auth-input w-full"
          autoComplete="name"
        />
      ) : null}
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="auth-input w-full"
        autoComplete="email"
      />
      {!isCompact ? (
        <input
          type="text"
          value={referrer}
          onChange={(e) => setReferrer(e.target.value)}
          placeholder="How did you hear about us? (optional)"
          className="auth-input w-full"
        />
      ) : null}
      {error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="auth-btn-primary w-full disabled:opacity-50"
      >
        {busy ? "Joining…" : "Request invite"}
      </button>
    </form>
  );
}
