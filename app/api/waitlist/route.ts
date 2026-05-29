import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  RATE_LIMITS,
  rateLimitByIp,
  rateLimitResponse,
} from "@/lib/rate-limit/presets";
import { handleRouteError } from "@/lib/errors/api";

const bodySchema = z.object({
  email: z.string().email().max(254),
  source: z.string().max(64).optional(),
  referrer: z.string().max(256).optional(),
});

export async function POST(request: Request) {
  const limited = await rateLimitByIp(request, "waitlist", RATE_LIMITS.waitlist);
  if (!limited.ok) {
    return rateLimitResponse(limited);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();

  try {
    await prisma.waitlistEntry.upsert({
      where: { email },
      create: {
        email,
        source: parsed.data.source,
        referrer: parsed.data.referrer,
      },
      update: {
        source: parsed.data.source ?? undefined,
      },
    });

    return NextResponse.json({
      message: "Welcome — you are on the early access list.",
    });
  } catch (error) {
    return handleRouteError(error, {
      category: "waitlist",
      path: "/api/waitlist",
    });
  }
}
