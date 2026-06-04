import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server";
import { prisma } from "@/lib/prisma";
import { sendFeedbackThankYouEmail } from "@/lib/beta/emails";
import { resolveValidUserId } from "@/lib/auth/session-user";
import { handleRouteError } from "@/lib/errors/api";

const bodySchema = z.object({
  type: z.enum(["bug", "feature", "ux", "general"]),
  message: z.string().min(1).max(4000),
  rating: z.number().int().min(1).max(5).optional(),
  severity: z.enum(["low", "medium", "high"]).optional(),
  flow: z.string().max(64).optional(),
  pagePath: z.string().max(256).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });
  }

  const trimmed = parsed.data.message.trim();
  if (trimmed.length < 1 && !parsed.data.rating) {
    return NextResponse.json(
      { error: "Add a message or rating" },
      { status: 400 },
    );
  }

  try {
    const userId = await resolveValidUserId(session?.user?.id);
    const row = await prisma.productFeedback.create({
      data: {
        userId: userId ?? undefined,
        type: parsed.data.type,
        message: trimmed || `Rating: ${parsed.data.rating}/5`,
        rating: parsed.data.rating,
        severity: parsed.data.severity,
        flow: parsed.data.flow,
        pagePath: parsed.data.pagePath,
      },
    });

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });
      if (user?.email) {
        void sendFeedbackThankYouEmail(user.email, user.name ?? undefined);
      }
    }

    const event =
      parsed.data.type === "bug"
        ? ANALYTICS_EVENTS.BETA_BUG_REPORTED
        : parsed.data.type === "feature"
          ? ANALYTICS_EVENTS.BETA_FEATURE_REQUESTED
          : ANALYTICS_EVENTS.BETA_FEEDBACK_SUBMITTED;

    await trackServerEvent(event, {
      userId: session?.user?.id,
      properties: {
        feedback_type: parsed.data.type,
        severity: parsed.data.severity,
        flow: parsed.data.flow,
      },
    });

    return NextResponse.json({ id: row.id, ok: true });
  } catch (error) {
    return handleRouteError(error, {
      category: "beta_feedback",
      path: "/api/beta/feedback",
    });
  }
}
