import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { resolveValidUserId } from "@/lib/auth/session-user";
import { prisma } from "@/lib/prisma";
import {
  RATE_LIMITS,
  rateLimitByIp,
  rateLimitResponse,
} from "@/lib/rate-limit/presets";
import { handleRouteError } from "@/lib/errors/api";
import { USER_MESSAGES } from "@/lib/errors/messages";

const bodySchema = z.object({
  email: z.string().email().max(254),
  name: z.string().max(120).optional(),
  category: z.enum([
    "general",
    "billing",
    "refund",
    "technical",
    "feedback",
    "privacy",
  ]),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(5000),
});

export async function POST(request: Request) {
  const limited = await rateLimitByIp(request, "support", RATE_LIMITS.support);
  if (!limited.ok) {
    return rateLimitResponse(limited, USER_MESSAGES.rateLimitedShort);
  }

  const session = await auth();
  const userId = await resolveValidUserId(session?.user?.id);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  try {
    await prisma.supportTicket.create({
      data: {
        userId: userId ?? null,
        email: parsed.data.email.toLowerCase().trim(),
        name: parsed.data.name?.trim(),
        category: parsed.data.category,
        subject: parsed.data.subject.trim(),
        message: parsed.data.message.trim(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, {
      category: "support",
      userMessage: USER_MESSAGES.supportFailed,
      userId: userId ?? undefined,
      path: "/api/support",
    });
  }
}
