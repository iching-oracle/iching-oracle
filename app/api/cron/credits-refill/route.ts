import { NextResponse } from "next/server";
import { ensureCreditsRefreshed } from "@/lib/credits/refill";
import { prisma } from "@/lib/prisma";

/**
 * Cron-compatible refill endpoint.
 * Secure with CRON_SECRET header: Authorization: Bearer <CRON_SECRET>
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

  if (!secret || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: { id: true },
    take: 500,
  });

  let processed = 0;
  for (const user of users) {
    await ensureCreditsRefreshed(user.id);
    processed += 1;
  }

  return NextResponse.json({ processed });
}
