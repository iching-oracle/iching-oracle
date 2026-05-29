import { NextResponse } from "next/server";
import { z } from "zod";
import { logSystemEvent } from "@/lib/monitoring/logger";
import {
  RATE_LIMITS,
  rateLimitByIp,
  rateLimitResponse,
} from "@/lib/rate-limit/presets";

const bodySchema = z.object({
  message: z.string().max(2000),
  stack: z.string().max(8000).optional(),
  path: z.string().max(500).optional(),
  component: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const limited = await rateLimitByIp(
    request,
    "client-error",
    RATE_LIMITS.clientError,
  );
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
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await logSystemEvent({
    level: "error",
    category: "client",
    message: parsed.data.message,
    path: parsed.data.path,
    metadata: {
      stack: parsed.data.stack,
      component: parsed.data.component,
    },
  });

  return NextResponse.json({ ok: true });
}
