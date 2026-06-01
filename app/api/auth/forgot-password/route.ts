import { NextResponse } from "next/server";
import {
  getGenericResetMessage,
  requestPasswordReset,
} from "@/lib/auth/password-reset";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import {
  RATE_LIMITS,
  rateLimitByIp,
  rateLimitResponse,
} from "@/lib/rate-limit/presets";
import { handleRouteError } from "@/lib/errors/api";

export async function POST(request: Request) {
  const limited = await rateLimitByIp(
    request,
    "forgot-password",
    RATE_LIMITS.forgotPassword,
  );
  if (!limited.ok) {
    return rateLimitResponse(limited);
  }

  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid email" },
        { status: 400 },
      );
    }

    const result = await requestPasswordReset(parsed.data.email);

    if (!result.sent) {
      return NextResponse.json(
        {
          error:
            "We could not send the reset email right now. Please try again shortly.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      success: true,
      message: getGenericResetMessage(),
    });
  } catch (error) {
    return handleRouteError(error, { category: "auth_forgot_password" });
  }
}
