import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { apiUnauthorized, apiValidation, handleRouteError } from "@/lib/errors/api";
import { trackServerEvent } from "@/lib/analytics/server";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  resonance: z.enum(["deeply", "somewhat", "not_really"]).optional(),
  helpful: z.boolean().optional(),
  comment: z.string().max(2000).optional(),
  category: z.string().max(64).optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

function resonanceFromHelpful(helpful: boolean): "deeply" | "not_really" {
  return helpful ? "deeply" : "not_really";
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiUnauthorized();
  }

  const { id: readingId } = await params;

  const reading = await prisma.reading.findFirst({
    where: { id: readingId, userId: session.user.id },
    select: { id: true, category: true },
  });

  if (!reading) {
    return NextResponse.json({ error: "Reading not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiValidation("Invalid JSON");
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return apiValidation("Invalid feedback");
  }

  const resonance =
    parsed.data.resonance ??
    (typeof parsed.data.helpful === "boolean"
      ? resonanceFromHelpful(parsed.data.helpful)
      : null);

  if (!resonance) {
    return apiValidation("Resonance or helpful required");
  }

  try {
    await prisma.readingFeedback.upsert({
      where: {
        userId_readingId: {
          userId: session.user.id,
          readingId,
        },
      },
      create: {
        userId: session.user.id,
        readingId,
        resonance,
        comment: parsed.data.comment?.trim(),
        category: parsed.data.category ?? reading.category,
      },
      update: {
        resonance,
        comment: parsed.data.comment?.trim(),
      },
    });

    await trackServerEvent(ANALYTICS_EVENTS.READING_FEEDBACK, {
      userId: session.user.id,
      properties: {
        reading_id: readingId,
        resonance,
        category: parsed.data.category ?? reading.category,
        has_comment: Boolean(parsed.data.comment?.trim()),
      },
    });

    await trackServerEvent(ANALYTICS_EVENTS.BETA_FEEDBACK_SUBMITTED, {
      userId: session.user.id,
      properties: { resonance, source: "reading" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, {
      category: "reading_feedback",
      userId: session.user.id,
      path: `/api/readings/${readingId}/feedback`,
    });
  }
}
