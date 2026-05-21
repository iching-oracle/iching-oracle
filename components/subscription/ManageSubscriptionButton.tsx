"use client";

import { useState } from "react";

type ManageSubscriptionButtonProps = {
  className?: string;
};

export function ManageSubscriptionButton({
  className = "",
}: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/customer-portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not open billing portal.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={openPortal}
        disabled={loading}
        className="auth-btn-secondary text-sm disabled:opacity-60"
      >
        {loading ? "Opening…" : "Manage subscription"}
      </button>
      {error ? (
        <p className="mt-2 text-xs text-red-300">{error}</p>
      ) : null}
    </div>
  );
}
