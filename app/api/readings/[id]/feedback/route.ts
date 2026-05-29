import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { apiUnauthorized, apiValidation, handleRouteError } from "@/lib/errors/api";
import { trackServerEvent } from "@/lib/analytics/server";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  helpful: z.boolean(),
  category: z.string().max(64).optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

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

  try {
    await trackServerEvent(ANALYTICS_EVENTS.READING_FEEDBACK, {
      userId: session.user.id,
      properties: {
        reading_id: readingId,
        helpful: parsed.data.helpful,
        category: parsed.data.category ?? reading.category,
      },
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
