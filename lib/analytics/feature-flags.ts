"use client";

import posthog from "posthog-js";
import { isPostHogConfigured } from "@/lib/analytics/posthog-config";

/** Known feature flags — register in PostHog dashboard. */
export const FEATURE_FLAGS = {
  NEW_ONBOARDING: "new_onboarding",
  PREMIUM_TRIAL_BANNER: "premium_trial_banner",
  INSIGHTS_BETA: "insights_beta",
} as const;

export type FeatureFlagKey =
  (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];

/**
 * Evaluate a feature flag (client-side, consent-gated via PostHog init).
 * Returns undefined when PostHog is not loaded.
 */
export function getFeatureFlag(flag: FeatureFlagKey): boolean | string | undefined {
  if (!isPostHogConfigured() || typeof window === "undefined") return undefined;
  try {
    return posthog.getFeatureFlag(flag);
  } catch {
    return undefined;
  }
}

export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  const value = getFeatureFlag(flag);
  return value === true || value === "true";
}

/** Subscribe to flag updates (e.g. after PostHog loads remote config). */
export function onFeatureFlagsReady(callback: () => void): () => void {
  if (!isPostHogConfigured() || typeof window === "undefined") {
    return () => {};
  }
  posthog.onFeatureFlags(callback);
  return () => {
    /* PostHog has no unsubscribe; safe no-op for SPA */
  };
}
