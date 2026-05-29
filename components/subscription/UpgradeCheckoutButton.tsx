"use client";

import { useState } from "react";
import { trackSubscriptionEventClient } from "@/lib/analytics/subscription-events-client";
import { showPaymentError } from "@/hooks/use-app-toast";
import { USER_MESSAGES } from "@/lib/errors/messages";

type UpgradeCheckoutButtonProps = {
  label?: string;
  className?: string;
  highlighted?: boolean;
};

export function UpgradeCheckoutButton({
  label = "Upgrade to Premium",
  className = "",
  highlighted = false,
}: UpgradeCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    trackSubscriptionEventClient("upgrade_clicked");

    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
      });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setError(data.error ?? USER_MESSAGES.checkoutFailed);
        showPaymentError(startCheckout);
        return;
      }

      trackSubscriptionEventClient("checkout_opened");
      window.location.href = data.url;
    } catch {
      setError(USER_MESSAGES.checkoutFailed);
      showPaymentError(startCheckout);
    } finally {
      setLoading(false);
    }
  }

  const baseClass = highlighted
    ? "group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cosmic-purple via-violet-600 to-cosmic-deep px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_32px_rgba(124,58,237,0.45)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_48px_rgba(124,58,237,0.6)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
    : "auth-btn-primary w-full disabled:opacity-60";

  return (
    <div className={className}>
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className={baseClass}
      >
        {loading ? "Redirecting to Stripe…" : label}
      </button>
      {error ? (
        <p className="mt-2 text-center text-xs text-red-300">{error}</p>
      ) : null}
    </div>
  );
}
