"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { SupportCategory } from "@/types/trust";

const CATEGORIES: Array<{ value: SupportCategory; label: string }> = [
  { value: "general", label: "General question" },
  { value: "billing", label: "Billing" },
  { value: "refund", label: "Refund request" },
  { value: "technical", label: "Technical issue" },
  { value: "feedback", label: "Feedback" },
  { value: "privacy", label: "Privacy / data" },
];

type ContactFormProps = {
  defaultCategory?: SupportCategory;
  userEmail?: string;
  userName?: string;
};

export function ContactForm({
  defaultCategory = "general",
  userEmail = "",
  userName = "",
}: ContactFormProps) {
  const [email, setEmail] = useState(userEmail);
  const [name, setName] = useState(userName);
  const [category, setCategory] = useState<SupportCategory>(defaultCategory);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, category, subject, message }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not send message");
    }
  };

  if (status === "done") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-amber-gold/25 bg-amber-gold/10 p-8 text-center"
        role="status"
      >
        <p className="font-serif text-xl text-foreground">Message received</p>
        <p className="mt-2 text-sm text-zen-muted">
          We typically respond within two business days.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="auth-label" htmlFor="support-email">
            Email
          </label>
          <input
            id="support-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input min-h-[44px]"
          />
        </div>
        <div>
          <label className="auth-label" htmlFor="support-name">
            Name (optional)
          </label>
          <input
            id="support-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-input min-h-[44px]"
          />
        </div>
      </div>

      <div>
        <label className="auth-label" htmlFor="support-category">
          Category
        </label>
        <select
          id="support-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as SupportCategory)}
          className="auth-input min-h-[44px]"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="auth-label" htmlFor="support-subject">
          Subject
        </label>
        <input
          id="support-subject"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="auth-input min-h-[44px]"
        />
      </div>

      <div>
        <label className="auth-label" htmlFor="support-message">
          Message
        </label>
        <textarea
          id="support-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="auth-input resize-none"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="auth-btn-primary min-h-[44px] w-full sm:w-auto disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
