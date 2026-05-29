import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/email/cron-auth";
import { runEmailBatch } from "@/lib/email/cron-runner";
import { sendDailyOracleEmail } from "@/lib/email/lifecycle/daily-oracle-email";
import { startOfUtcDay } from "@/lib/email/send";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  return POST(request);
}

export async function POST(request: Request) {
  const unauthorized = verifyCronRequest(request);
  if (unauthorized) return unauthorized;

  const dayStart = startOfUtcDay();

  const users = await prisma.user.findMany({
    where: {
      emailVerified: { not: null },
      emailGlobalUnsubscribedAt: null,
      emailDailyGuidance: true,
      OR: [{ lastDailyEmailAt: null }, { lastDailyEmailAt: { lt: dayStart } }],
    },
    select: { id: true },
    take: 200,
  });

  const result = await runEmailBatch("daily_oracle", users, async (user) => {
    const outcome = await sendDailyOracleEmail(user.id);
    return { ok: outcome.ok, reason: "reason" in outcome ? outcome.reason : undefined };
  });

  return NextResponse.json(result);
}
