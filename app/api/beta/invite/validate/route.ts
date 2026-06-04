import { NextResponse } from "next/server";
import { z } from "zod";
import { validateInviteCode } from "@/lib/beta/invites";
import { normalizeInviteCode } from "@/lib/beta/invite-code";
import {
  RATE_LIMITS,
  rateLimitByIp,
  rateLimitResponse,
} from "@/lib/rate-limit/presets";

const bodySchema = z.object({
  code: z.string().min(4).max(32),
  email: z.string().email().optional(),
});

export async function POST(request: Request) {
  const limited = await rateLimitByIp(request, "auth", RATE_LIMITS.auth);
  if (!limited.ok) {
    return rateLimitResponse(limited);
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ valid: false, error: "Invalid code" }, { status: 400 });
  }

  const result = await validateInviteCode(parsed.data.code, parsed.data.email);
  if (!result.ok) {
    return NextResponse.json({ valid: false, error: result.reason });
  }

  return NextResponse.json({
    valid: true,
    code: normalizeInviteCode(parsed.data.code),
  });
}
