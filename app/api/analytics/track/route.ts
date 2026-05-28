import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import type { AnalyticsFunnelId } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server";
import { sanitizeAnalyticsProperties } from "@/lib/analytics/privacy";

const trackSchema = z.object({
  event: z.string().min(1).max(120),
  properties: z.record(z.string(), z.unknown()).optional(),
  sessionId: z.string().max(64).optional(),
  distinctId: z.string().max(64).optional(),
  funnel: z.string().max(64).optional(),
  funnelStep: z.string().max(64).optional(),
  userId: z.string().max(64).optional(),
});

export async function POST(request: Request) {
  const consent = request.headers.get("X-Analytics-Consent") === "true";
  if (!consent) {
    return NextResponse.json({ error: "Analytics consent required" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const session = await auth();
  const userId = session?.user?.id ?? parsed.data.userId;

  const properties = sanitizeAnalyticsProperties(
    parsed.data.properties as Record<string, unknown>,
  );

  await trackServerEvent(parsed.data.event, {
    userId,
    sessionId: parsed.data.sessionId,
    distinctId: parsed.data.distinctId,
    funnel: parsed.data.funnel as AnalyticsFunnelId | undefined,
    funnelStep: parsed.data.funnelStep,
    properties,
    forwardToPostHog: false,
  });

  return NextResponse.json({ ok: true });
}
