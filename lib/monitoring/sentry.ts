import * as Sentry from "@sentry/nextjs";
import { isSentryEnabled } from "@/sentry.shared.config";
import { sanitizeMonitoringContext } from "@/lib/monitoring/sanitize";

export { isSentryEnabled };

export type MonitoringContext = {
  category?: string;
  userId?: string;
  path?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  level?: "error" | "warning" | "info";
};

/**
 * Capture an exception in Sentry with sanitized context.
 * Safe to call when Sentry is disabled (no-op).
 */
export function captureException(
  error: unknown,
  context?: MonitoringContext,
): string | undefined {
  if (!isSentryEnabled()) {
    if (process.env.NODE_ENV === "development") {
      console.error("[monitoring]", error, context?.category);
    }
    return undefined;
  }

  const safeExtra = sanitizeMonitoringContext(context?.extra);

  return Sentry.withScope((scope) => {
    if (context?.category) {
      scope.setTag("category", context.category);
    }
    if (context?.path) {
      scope.setTag("path", context.path.slice(0, 200));
    }
    if (context?.userId) {
      scope.setUser({ id: context.userId });
    }
    if (context?.tags) {
      for (const [k, v] of Object.entries(context.tags)) {
        scope.setTag(k, v.slice(0, 200));
      }
    }
    if (safeExtra) {
      scope.setContext("details", safeExtra);
    }
    if (context?.level) {
      scope.setLevel(context.level);
    }

    return Sentry.captureException(
      error instanceof Error ? error : new Error(String(error)),
    );
  });
}

/** Structured message for non-throwing failures (webhooks, AI, auth). */
export function captureMessage(
  message: string,
  context?: MonitoringContext,
): string | undefined {
  if (!isSentryEnabled()) return undefined;

  const safeExtra = sanitizeMonitoringContext(context?.extra);

  return Sentry.withScope((scope) => {
    if (context?.category) scope.setTag("category", context.category);
    if (context?.userId) scope.setUser({ id: context.userId });
    if (safeExtra) scope.setContext("details", safeExtra);
    scope.setLevel(context?.level ?? "warning");
    return Sentry.captureMessage(message.slice(0, 500));
  });
}

/** Attach user id after login — never pass email or name. */
export function setSentryUser(user: { id: string; plan?: string } | null): void {
  if (!isSentryEnabled()) return;
  if (!user) {
    Sentry.setUser(null);
    return;
  }
  Sentry.setUser({
    id: user.id,
    ...(user.plan ? { segment: user.plan } : {}),
  });
}

/** Example custom breadcrumb for product flows. */
export function addBreadcrumb(
  message: string,
  data?: Record<string, unknown>,
): void {
  if (!isSentryEnabled()) return;
  Sentry.addBreadcrumb({
    category: "app",
    message: message.slice(0, 200),
    data: sanitizeMonitoringContext(data),
    level: "info",
  });
}
