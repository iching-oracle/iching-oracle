"use client";

import Script from "next/script";
import { hasAnalyticsConsent } from "@/lib/compliance/consent";
import type { ConsentState } from "@/types/trust";

type AnalyticsScriptsProps = {
  consent: ConsentState | null;
};

/** Loads Google Analytics only after explicit consent. PostHog is initialized via posthog-js in lib/analytics/client.ts. */
export function AnalyticsScripts({ consent }: AnalyticsScriptsProps) {
  if (!hasAnalyticsConsent(consent)) return null;

  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

  return (
    <>
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}
    </>
  );
}
