import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/email/cron-auth";
import { runEmailBatch } from "@/lib/email/cron-runner";
import {
  findReengagementCandidates,
  sendReengagementEmail,
} from "@/lib/email/lifecycle/re-engagement";

export async function GET(request: Request) {
  return POST(request);
}

export async function POST(request: Request) {
  const unauthorized = verifyCronRequest(request);
  if (unauthorized) return unauthorized;

  const tiers = [3, 7, 14] as const;
  const aggregate = {
    processed: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    errors: [] as string[],
    tiers: {} as Record<string, { sent: number; failed: number }>,
  };

  for (const tier of tiers) {
    const candidates = await findReengagementCandidates(tier, 100);
    const result = await runEmailBatch(
      `reengagement_${tier}d`,
      candidates,
      async (user) => {
        const outcome = await sendReengagementEmail(user.id, tier);
        return { ok: outcome.ok, reason: "reason" in outcome ? outcome.reason : undefined };
      },
    );

    aggregate.processed += result.processed;
    aggregate.sent += result.sent;
    aggregate.skipped += result.skipped;
    aggregate.failed += result.failed;
    aggregate.errors.push(...result.errors);
    aggregate.tiers[`${tier}d`] = { sent: result.sent, failed: result.failed };
  }

  return NextResponse.json(aggregate);
}
