"use client";

import { useState } from "react";

type StripeCheckoutButtonProps = {
  hexagramId?: string;
  className?: string;
};

export function StripeCheckoutButton({
  hexagramId,
  className = "",
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setError(data.error ?? "Could not start checkout. Please try again.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isLoading}
        className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cosmic-purple via-violet-600 to-cosmic-deep px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_32px_rgba(124,58,237,0.45)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_48px_rgba(124,58,237,0.6)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                aria-hidden
              />
              Redirecting to Stripe…
            </>
          ) : (
            "Upgrade to Premium"
          )}
        </span>
        <span
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        />
      </button>
      {error ? (
        <p className="mt-2 text-center text-xs text-red-300">{error}</p>
      ) : null}
    </div>
  );
}
