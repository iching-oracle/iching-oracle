"use client";

import { captureException } from "@/lib/monitoring/sentry";

/** Report a client-side error to Sentry + first-party monitoring API. */
export function reportClientError(
  error: Error,
  context?: { path?: string; component?: string },
): void {
  captureException(error, {
    category: "client",
    path: context?.path,
    extra: { component: context?.component },
  });

  void fetch("/api/monitoring/client-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: error.message,
      stack: error.stack,
      path: context?.path ?? (typeof window !== "undefined" ? window.location.pathname : undefined),
      component: context?.component,
    }),
  }).catch(() => {
    /* non-blocking */
  });
}
