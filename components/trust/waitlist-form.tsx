"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type WaitlistFormProps = {
  source?: string;
  className?: string;
};

export function WaitlistForm({ source = "footer", className = "" }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not join waitlist");
      setStatus("success");
      setMessage(data.message ?? "You are on the list.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (status === "success") {
    return (
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-sm text-amber-gold ${className}`}
        role="status"
      >
        {message}
      </motion.p>
    );
  }

  return (
    <form onSubmit={submit} className={`space-y-3 ${className}`}>
      <label className="sr-only" htmlFor={`waitlist-${source}`}>
        Email for early access
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={`waitlist-${source}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="auth-input min-h-[44px] flex-1"
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="auth-btn-primary min-h-[44px] shrink-0 px-6 text-sm disabled:opacity-60"
        >
          {status === "loading" ? "Joining…" : "Early access"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-xs text-red-300" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
