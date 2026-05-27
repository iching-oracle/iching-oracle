"use client";

import { useEffect } from "react";
import { hasAnalyticsConsent } from "@/lib/compliance/consent";
import { useConsent } from "@/components/trust/consent-provider";

type SeoTrackerProps = {
  path: string;
  event?: "page_view" | "share" | "cta_click";
};

export function SeoTracker({ path, event = "page_view" }: SeoTrackerProps) {
  const { consent } = useConsent();

  useEffect(() => {
    if (!hasAnalyticsConsent(consent)) return;

    void fetch("/api/seo/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, event }),
      keepalive: true,
    });

    const w = window as Window & {
      posthog?: { capture: (e: string, p: object) => void };
    };
    w.posthog?.capture("seo_page_view", { path, event });
  }, [path, event, consent]);

  return null;
}
