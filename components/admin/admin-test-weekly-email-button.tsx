"use client";

import { useState } from "react";

export function AdminTestWeeklyEmailButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handleSend() {
    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch("/api/admin/test-weekly-email", { method: "POST" });
      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        email?: string;
        hexagram?: string;
        message?: string;
      };

      if (!res.ok || !data.success) {
        setStatus("error");
        setMessage(data.error ?? "Failed to send test email.");
        return;
      }

      setStatus("success");
      setMessage(
        `${data.message ?? "Sent"} to ${data.email ?? "your inbox"} (${data.hexagram ?? "oracle"}).`,
      );
    } catch {
      setStatus("error");
      setMessage("Failed to send test email. Please try again.");
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-zen-surface/40 p-6">
      <h2 className="text-sm font-medium uppercase tracking-widest text-amber-gold">
        Weekly Oracle Email
      </h2>
      <p className="mt-2 text-sm text-zen-muted">
        Send the current week&apos;s shared oracle to your account inbox only.
        Does not affect production cron subscribers.
      </p>

      <button
        type="button"
        onClick={handleSend}
        disabled={status === "loading"}
        className="auth-btn-secondary mt-4 disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send Test Weekly Email"}
      </button>

      {message ? (
        <p
          className={`mt-3 text-sm ${status === "error" ? "text-red-300" : "text-cosmic-violet"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
