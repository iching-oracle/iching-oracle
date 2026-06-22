import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/email/cron-auth";
import { runEmailBatch } from "@/lib/email/cron-runner";
import { sendWeeklyOracleEmail } from "@/lib/email/lifecycle/weekly-oracle-email";
import { startOfUtcWeek } from "@/lib/weekly-oracle/generate";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  return POST(request);
}

/** Runs every Monday UTC — sends the shared weekly oracle to opted-in users. */
export async function POST(request: Request) {
  const unauthorized = verifyCronRequest(request);
  if (unauthorized) return unauthorized;

  const weekStart = startOfUtcWeek();

  const users = await prisma.user.findMany({
    where: {
      emailVerified: { not: null },
      emailGlobalUnsubscribedAt: null,
      weeklyOracleEnabled: true,
      OR: [
        { lastWeeklyOracleEmailAt: null },
        { lastWeeklyOracleEmailAt: { lt: weekStart } },
      ],
    },
    select: { id: true },
    take: 200,
  });

  const result = await runEmailBatch("weekly_oracle", users, async (user) => {
    const outcome = await sendWeeklyOracleEmail(user.id);
    return { ok: outcome.ok, reason: "reason" in outcome ? outcome.reason : undefined };
  });

  return NextResponse.json(result);
}
