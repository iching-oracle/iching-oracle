"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { hasAnalyticsConsent } from "@/lib/compliance/consent";
import { useConsent } from "@/components/trust/consent-provider";
import {
  identifyUser,
  initPostHogClient,
  optInPostHog,
  optOutPostHog,
  resetAnalyticsIdentity,
} from "@/lib/analytics/client";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { useAnalytics } from "@/hooks/use-analytics";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";

/**
 * Initializes PostHog when consent is granted, identifies users on login,
 * and tracks session start once per browser session.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { consent } = useConsent();
  const { data: session, status } = useSession();
  const { track, canTrack } = useAnalytics();
  const sessionStartedRef = useRef(false);

  useEffect(() => {
    if (!hasAnalyticsConsent(consent)) {
      optOutPostHog();
      return;
    }

    initPostHogClient();
    optInPostHog();
  }, [consent]);

  useEffect(() => {
    if (!canTrack || status !== "authenticated" || !session?.user?.id) return;

    identifyUser(session.user.id, {
      plan_type: "unknown",
    });
  }, [canTrack, session?.user?.id, status]);

  useEffect(() => {
    if (!canTrack || status === "unauthenticated") {
      resetAnalyticsIdentity();
    }
  }, [canTrack, status]);

  useEffect(() => {
    if (!canTrack || sessionStartedRef.current) return;
    sessionStartedRef.current = true;
    track(ANALYTICS_EVENTS.SESSION_STARTED);
  }, [canTrack, track]);

  return (
    <>
      <PageViewTracker />
      {children}
    </>
  );
}
