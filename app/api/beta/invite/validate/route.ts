import { NextResponse } from "next/server";
import { z } from "zod";
import { validateInviteCode } from "@/lib/beta/invites";
import { normalizeInviteCode } from "@/lib/beta/invite-code";
import { guardAuthRoute } from "@/lib/api/route-guard";
import { recordFailedRequest } from "@/lib/rate-limit/abuse";
import { RATE_LIMITS } from "@/lib/rate-limit/presets";

const bodySchema = z.object({
  code: z.string().min(4).max(40),
  email: z.string().email().optional(),
});

export async function POST(request: Request) {
  const guarded = await guardAuthRoute(request, "invite-validate", RATE_LIMITS.auth);
  if (guarded) return guarded;

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ valid: false, error: "Invalid code" }, { status: 400 });
  }

  const result = await validateInviteCode(parsed.data.code, parsed.data.email);
  if (!result.ok) {
    void recordFailedRequest(request, "invalid_invite");
    return NextResponse.json({ valid: false, error: result.reason });
  }

  return NextResponse.json({
    valid: true,
    code: normalizeInviteCode(parsed.data.code),
  });
}
