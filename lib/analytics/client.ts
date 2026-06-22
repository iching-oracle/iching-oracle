"use client";

import posthog from "posthog-js";
import type { AnalyticsEventName, AnalyticsFunnelId } from "@/lib/analytics/events";
import { getPostHogHost, isPostHogConfigured } from "@/lib/analytics/posthog-config";
import type { AnalyticsProperties } from "@/lib/analytics/properties";
import { sanitizeAnalyticsProperties } from "@/lib/analytics/privacy";

const DISTINCT_ID_KEY = "iching-analytics-id";
const SESSION_ID_KEY = "iching-analytics-session";

let posthogInitialized = false;
let replayRequested = false;

function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

function logPostHogDiag(message: string, data?: Record<string, unknown>): void {
  if (!isDev()) return;
  if (data) {
    console.info(`[posthog] ${message}`, data);
  } else {
    console.info(`[posthog] ${message}`);
  }
}

function getPostHogDiagnostics() {
  const dnt =
    typeof navigator !== "undefined"
      ? navigator.doNotTrack === "1" ||
        (navigator as Navigator & { msDoNotTrack?: string }).msDoNotTrack === "1" ||
        (window as Window & { doNotTrack?: string }).doNotTrack === "1"
      : false;

  return {
    initialized: posthogInitialized,
    hasOptedIn: posthog.has_opted_in_capturing?.() ?? null,
    hasOptedOut: posthog.has_opted_out_capturing?.() ?? null,
    sessionRecordingStarted: posthog.sessionRecordingStarted?.() ?? null,
    respectDnt: true,
    browserDnt: dnt,
    distinctId: posthog.get_distinct_id?.() ?? null,
  };
}

function applyConsentCaptureAndReplay(): void {
  posthog.opt_in_capturing();
  startSessionReplayAfterConsent();
  logPostHogDiag("opted in", getPostHogDiagnostics());
}

function isPostHogSdkLoaded(): boolean {
  return Boolean((posthog as { __loaded?: boolean }).__loaded);
}

function startSessionReplayAfterConsent(): void {
  try {
    posthog.startSessionRecording();
  } catch (error) {
    logPostHogDiag("startSessionRecording failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

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

  if (isDev()) {
    posthog.debug();
  }

  posthog.init(key, {
    api_host: getPostHogHost(),
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    autocapture: true,
    respect_dnt: true,
    advanced_disable_feature_flags: false,
    // Consent-gated replay: init disabled, start explicitly after opt-in.
    disable_session_recording: true,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "[data-ph-mask]",
    },
    loaded: () => {
      logPostHogDiag("SDK loaded", getPostHogDiagnostics());
      if (replayRequested) {
        replayRequested = false;
        applyConsentCaptureAndReplay();
      }
    },
  });

  posthogInitialized = true;
  logPostHogDiag("init complete", getPostHogDiagnostics());
}

export function optOutPostHog(): void {
  replayRequested = false;
  if (posthogInitialized) {
    try {
      posthog.stopSessionRecording();
    } catch {
      /* non-blocking */
    }
    posthog.opt_out_capturing();
    posthog.reset();
    logPostHogDiag("opted out", getPostHogDiagnostics());
  }
  posthogInitialized = false;
}

export function optInPostHog(): void {
  replayRequested = true;
  initPostHogClient();
  if (!posthogInitialized) {
    replayRequested = false;
    return;
  }

  if (isPostHogSdkLoaded()) {
    replayRequested = false;
    applyConsentCaptureAndReplay();
  } else {
    logPostHogDiag("replay deferred until SDK loaded");
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
  if (!posthogInitialized) return;

  posthog.reset();
  if (posthog.has_opted_in_capturing?.()) {
    startSessionReplayAfterConsent();
  }
  logPostHogDiag("identity reset", getPostHogDiagnostics());
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
