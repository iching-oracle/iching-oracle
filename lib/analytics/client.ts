"use client";

import posthog from "posthog-js";
import type { AnalyticsEventName, AnalyticsFunnelId } from "@/lib/analytics/events";
import { getPostHogHost, isPostHogConfigured } from "@/lib/analytics/posthog-config";
import type { AnalyticsProperties } from "@/lib/analytics/properties";
import { sanitizeAnalyticsProperties } from "@/lib/analytics/privacy";

const DISTINCT_ID_KEY = "iching-analytics-id";
const SESSION_ID_KEY = "iching-analytics-session";

let posthogInitialized = false;

export function getOrCreateDistinctId(): string {
  if (typeof window === "undefined") return "anonymous";

  let id = localStorage.getItem(DISTINCT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DISTINCT_ID_KEY, id);
  }
  return id;
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "anonymous";

  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

export function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export function getTrafficSource(): string {
  if (typeof document === "undefined") return "direct";
  try {
    const ref = document.referrer;
    if (!ref) return "direct";
    const host = new URL(ref).hostname;
    if (host === window.location.hostname) return "internal";
    return host;
  } catch {
    return "direct";
  }
}

/** Initialize PostHog after analytics consent. */
export function initPostHogClient(): void {
  if (posthogInitialized || !isPostHogConfigured()) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!key) return;

  posthog.init(key, {
    api_host: getPostHogHost(),
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    autocapture: false,
    respect_dnt: true,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "[data-ph-mask]",
    },
  });

  posthogInitialized = true;
}

export function optOutPostHog(): void {
  if (posthogInitialized) {
    posthog.opt_out_capturing();
    posthog.reset();
  }
  posthogInitialized = false;
}

export function optInPostHog(): void {
  initPostHogClient();
  if (posthogInitialized) {
    posthog.opt_in_capturing();
  }
}

/** Identify logged-in user (no email in traits). */
export function identifyUser(
  userId: string,
  traits?: { plan_type?: string; is_premium?: boolean },
): void {
  if (!posthogInitialized) return;
  posthog.identify(userId, traits);
}

export function resetAnalyticsIdentity(): void {
  if (posthogInitialized) {
    posthog.reset();
  }
}

export type ClientTrackOptions = {
  userId?: string | null;
  funnel?: AnalyticsFunnelId;
  funnelStep?: string;
  properties?: AnalyticsProperties;
};

/**
 * Capture on client (PostHog) and mirror to first-party API.
 * Call only when analytics consent is granted.
 */
export function captureClientEvent(
  event: AnalyticsEventName | string,
  options: ClientTrackOptions = {},
): void {
  const safe = sanitizeAnalyticsProperties({
    ...options.properties,
    device_type: getDeviceType(),
    traffic_source: getTrafficSource(),
    funnel_step: options.funnelStep,
  });

  const sessionId = getOrCreateSessionId();
  const distinctId = getOrCreateDistinctId();

  if (posthogInitialized) {
    posthog.capture(event, {
      ...safe,
      funnel: options.funnel,
      funnel_step: options.funnelStep,
    });
  }

  void fetch("/api/analytics/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Analytics-Consent": "true",
    },
    body: JSON.stringify({
      event,
      properties: safe,
      sessionId,
      distinctId,
      funnel: options.funnel,
      funnelStep: options.funnelStep,
      userId: options.userId ?? undefined,
    }),
    keepalive: true,
  }).catch(() => {
    /* non-blocking */
  });
}
