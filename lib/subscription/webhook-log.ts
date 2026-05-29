import "server-only";

import { logSystemEvent } from "@/lib/monitoring/logger";

export type WebhookLogContext = {
  eventId: string;
  eventType: string;
  userId?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  invoiceId?: string | null;
  checkoutSessionId?: string | null;
  resolutionSource?: string;
  result: "success" | "skipped" | "error";
  message: string;
  metadata?: Record<string, unknown>;
};

export async function logStripeWebhook(context: WebhookLogContext): Promise<void> {
  const payload = {
    eventId: context.eventId,
    eventType: context.eventType,
    userId: context.userId ?? undefined,
    customerId: context.customerId ?? undefined,
    subscriptionId: context.subscriptionId ?? undefined,
    invoiceId: context.invoiceId ?? undefined,
    checkoutSessionId: context.checkoutSessionId ?? undefined,
    resolutionSource: context.resolutionSource,
    result: context.result,
    ...context.metadata,
  };

  const level =
    context.result === "error"
      ? "error"
      : context.result === "skipped"
        ? "warn"
        : "info";

  console.info(
    `[stripe/webhook] ${context.eventType} → ${context.result}: ${context.message}`,
    payload,
  );

  await logSystemEvent({
    level,
    category: "stripe_webhook",
    message: `${context.eventType}: ${context.message}`,
    userId: context.userId ?? undefined,
    path: "/api/stripe/webhook",
    metadata: payload,
  });
}
