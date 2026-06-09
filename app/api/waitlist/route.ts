import { NextResponse } from "next/server";
import { z } from "zod";
import { joinWaitlist } from "@/lib/beta/waitlist";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server";
import { guardPublicRoute } from "@/lib/api/route-guard";
import { RATE_LIMITS } from "@/lib/rate-limit/presets";
import { handleRouteError } from "@/lib/errors/api";

const bodySchema = z.object({
  email: z.string().email().max(254),
  name: z.string().max(120).optional(),
  source: z.string().max(64).optional(),
  referrer: z.string().max(256).optional(),
  referralCode: z.string().max(64).optional(),
});

export async function POST(request: Request) {
  const guarded = await guardPublicRoute({
    request,
    scope: "waitlist",
    ipPreset: RATE_LIMITS.waitlist,
  });
  if (guarded) return guarded;

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

  try {
    const result = await joinWaitlist(parsed.data);

    await trackServerEvent(ANALYTICS_EVENTS.BETA_WAITLIST_JOINED, {
      properties: {
        source: parsed.data.source ?? "unknown",
        created: result.created,
        position: result.position,
      },
    });

    return NextResponse.json({
      message: result.created
        ? "Welcome — you are on the early access list."
        : "You are already on the list. We will be in touch.",
      position: result.position,
      created: result.created,
    });
  } catch (error) {
    return handleRouteError(error, {
      category: "waitlist",
      path: "/api/waitlist",
    });
  }
}
