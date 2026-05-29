import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/email/cron-auth";
import { runEmailBatch } from "@/lib/email/cron-runner";
import { sendWeeklyReflectionEmail } from "@/lib/email/lifecycle/weekly-reflection";
import { prisma } from "@/lib/prisma";

function startOfUtcWeek(): Date {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

export async function GET(request: Request) {
  return POST(request);
}

/** Runs weekly on Monday UTC — sends reflection summaries to opted-in users. */
export async function POST(request: Request) {
  const unauthorized = verifyCronRequest(request);
  if (unauthorized) return unauthorized;

  const weekStart = startOfUtcWeek();

  const users = await prisma.user.findMany({
    where: {
      emailVerified: { not: null },
      emailGlobalUnsubscribedAt: null,
      emailWeeklyReflection: true,
      OR: [{ lastWeeklyEmailAt: null }, { lastWeeklyEmailAt: { lt: weekStart } }],
    },
    select: { id: true },
    take: 200,
  });

  const result = await runEmailBatch("weekly_reflection", users, async (user) => {
    const outcome = await sendWeeklyReflectionEmail(user.id);
    return { ok: outcome.ok, reason: "reason" in outcome ? outcome.reason : undefined };
  });

  return NextResponse.json(result);
}
