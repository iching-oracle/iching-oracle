import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/email/cron-auth";
import { runEmailBatch } from "@/lib/email/cron-runner";
import { refillFreeCreditsIfDue } from "@/lib/credits/refill";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  return POST(request);
}

/**
 * Cron-only free tier credit reset. Premium credits reset via Stripe invoice.paid.
 */
export async function POST(request: Request) {
  const unauthorized = verifyCronRequest(request);
  if (unauthorized) return unauthorized;

  let cursor: string | undefined;
  const batchSize = 200;
  const aggregate = {
    processed: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    errors: [] as string[],
  };

  while (true) {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { planType: "FREE" },
          {
            AND: [
              { subscriptionStatus: { not: "premium" } },
              {
                OR: [
                  { premiumUntil: null },
                  { premiumUntil: { lte: new Date() } },
                ],
              },
            ],
          },
        ],
      },
      select: { id: true },
      take: batchSize,
      ...(cursor
        ? { skip: 1, cursor: { id: cursor }, orderBy: { id: "asc" } }
        : { orderBy: { id: "asc" } }),
    });

    if (users.length === 0) break;

    const result = await runEmailBatch("free_credit_refill", users, async (user) => {
      const outcome = await refillFreeCreditsIfDue(user.id);
      if (!outcome.ok) {
        return { ok: false, reason: outcome.reason };
      }
      if (outcome.skipped) {
        return { ok: false, reason: "not_due" };
      }
      return { ok: true };
    });

    aggregate.processed += result.processed;
    aggregate.sent += result.sent;
    aggregate.skipped += result.skipped;
    aggregate.failed += result.failed;
    aggregate.errors.push(...result.errors);

    cursor = users[users.length - 1]?.id;
    if (users.length < batchSize) break;
  }

  return NextResponse.json(aggregate);
}
