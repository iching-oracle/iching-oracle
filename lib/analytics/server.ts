import "server-only";

import { PostHog } from "posthog-node";
import type { AnalyticsEventName, AnalyticsFunnelId } from "@/lib/analytics/events";
import { getPostHogHost, getPostHogKey } from "@/lib/analytics/posthog-config";
import type { AnalyticsProperties } from "@/lib/analytics/properties";
import { sanitizeAnalyticsProperties } from "@/lib/analytics/privacy";
import { prisma } from "@/lib/prisma";

let posthogServer: PostHog | null = null;

function getPostHogServer(): PostHog | null {
  const key = getPostHogKey();
  if (!key) return null;

  if (!posthogServer) {
    posthogServer = new PostHog(key, {
      host: getPostHogHost(),
      flushAt: 10,
      flushInterval: 5000,
    });
  }

  return posthogServer;
}

export type ServerTrackOptions = {
  userId?: string | null;
  sessionId?: string | null;
  distinctId?: string | null;
  funnel?: AnalyticsFunnelId;
  funnelStep?: string;
  properties?: AnalyticsProperties;
  /** Forward to PostHog (default: true when configured). */
  forwardToPostHog?: boolean;
};

/**
 * Persist a product event and optionally forward to PostHog.
 * Never pass question text or other PII in properties.
 */
export async function trackServerEvent(
  event: AnalyticsEventName | string,
  options: ServerTrackOptions = {},
): Promise<void> {
  const safe = sanitizeAnalyticsProperties(options.properties);
  const distinctId =
    options.distinctId ?? options.userId ?? options.sessionId ?? "anonymous";

  try {
    await prisma.productAnalyticsEvent.create({
      data: {
        event,
        userId: options.userId ?? undefined,
        sessionId: options.sessionId ?? undefined,
        distinctId,
        funnel: options.funnel,
        properties: {
          ...safe,
          ...(options.funnelStep ? { funnel_step: options.funnelStep } : {}),
        },
      },
    });
  } catch (err) {
    console.error("[analytics] Failed to persist event", event, err);
  }

  if (options.forwardToPostHog === false) return;

  const ph = getPostHogServer();
  if (!ph) return;

  try {
    ph.capture({
      distinctId,
      event,
      properties: {
        ...safe,
        funnel: options.funnel,
        funnel_step: options.funnelStep,
      },
    });
  } catch (err) {
    console.error("[analytics] PostHog capture failed", event, err);
  }
}

/** Flush pending PostHog events (e.g. before serverless function exit). */
export async function flushAnalytics(): Promise<void> {
  await posthogServer?.shutdown();
}
