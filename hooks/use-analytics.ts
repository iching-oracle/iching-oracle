"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { hasAnalyticsConsent } from "@/lib/compliance/consent";
import { useConsent } from "@/components/trust/consent-provider";
import {
  captureClientEvent,
  getDeviceType,
  getTrafficSource,
} from "@/lib/analytics/client";
import type { AnalyticsEventName, AnalyticsFunnelId } from "@/lib/analytics/events";
import type { AnalyticsProperties } from "@/lib/analytics/properties";

type TrackOptions = {
  properties?: AnalyticsProperties;
  funnel?: AnalyticsFunnelId;
  funnelStep?: string;
};

/**
 * Consent-gated product analytics for client components.
 */
export function useAnalytics() {
  const { consent } = useConsent();
  const { data: session } = useSession();
  const canTrack = hasAnalyticsConsent(consent);
  const userId = session?.user?.id;

  const track = useCallback(
    (event: AnalyticsEventName | string, options: TrackOptions = {}) => {
      if (!canTrack) return;

      captureClientEvent(event, {
        userId,
        funnel: options.funnel,
        funnelStep: options.funnelStep,
        properties: {
          ...options.properties,
          device_type: getDeviceType(),
          traffic_source: getTrafficSource(),
        },
      });
    },
    [canTrack, userId],
  );

  const trackPageView = useCallback(
    (path: string, title?: string) => {
      track("page_viewed", {
        properties: { page_path: path, page_title: title },
      });
    },
    [track],
  );

  const trackCTA = useCallback(
    (ctaId: string, properties?: AnalyticsProperties) => {
      track("cta_clicked", {
        properties: { cta_id: ctaId, ...properties },
      });
    },
    [track],
  );

  const trackButton = useCallback(
    (buttonId: string, properties?: AnalyticsProperties) => {
      track("button_clicked", {
        properties: { button_id: buttonId, ...properties },
      });
    },
    [track],
  );

  return {
    canTrack,
    track,
    trackPageView,
    trackCTA,
    trackButton,
  };
}
