import "server-only";

import { logSystemEvent } from "@/lib/monitoring/logger";

export type CronJobResult = {
  processed: number;
  sent: number;
  skipped: number;
  failed: number;
  errors: string[];
};

export async function runEmailBatch<T extends { id: string }>(
  label: string,
  items: T[],
  handler: (item: T) => Promise<{ ok: boolean; reason?: string }>,
): Promise<CronJobResult> {
  const result: CronJobResult = {
    processed: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  for (const item of items) {
    result.processed += 1;
    try {
      const outcome = await handler(item);
      if (outcome.ok) {
        result.sent += 1;
      } else if (
        outcome.reason === "opt_out" ||
        outcome.reason === "duplicate" ||
        outcome.reason === "already_sent_tier"
      ) {
        result.skipped += 1;
      } else {
        result.failed += 1;
        if (outcome.reason) {
          result.errors.push(`${item.id}: ${outcome.reason}`);
        }
      }
    } catch (err) {
      result.failed += 1;
      const message = err instanceof Error ? err.message : "unknown error";
      result.errors.push(`${item.id}: ${message}`);
    }
  }

  if (result.failed > 0) {
    await logSystemEvent({
      level: "error",
      category: "email_cron",
      message: `${label} completed with failures`,
      metadata: {
        sent: result.sent,
        failed: result.failed,
        errors: result.errors.slice(0, 10),
      },
    });
  }

  return result;
}
