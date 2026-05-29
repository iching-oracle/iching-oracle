import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server";
import { prisma } from "@/lib/prisma";
import { handleRouteError } from "@/lib/errors/api";

const bodySchema = z.object({
  type: z.enum(["bug", "feature", "ux", "general"]),
  message: z.string().min(3).max(4000),
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

  try {
    const row = await prisma.productFeedback.create({
      data: {
        userId: session?.user?.id,
        type: parsed.data.type,
        message: parsed.data.message.trim(),
        severity: parsed.data.severity,
        flow: parsed.data.flow,
        pagePath: parsed.data.pagePath,
      },
    });

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
