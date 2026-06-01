import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/auth/password-reset";
import { resetPasswordSchema } from "@/lib/validations/auth";
import {
  RATE_LIMITS,
  rateLimitByIp,
  rateLimitResponse,
} from "@/lib/rate-limit/presets";
import { handleRouteError } from "@/lib/errors/api";

export async function POST(request: Request) {
  const limited = await rateLimitByIp(
    request,
    "reset-password",
    RATE_LIMITS.resetPassword,
  );
  if (!limited.ok) {
    return rateLimitResponse(limited);
  }

  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const message =
        fieldErrors.password?.[0] ??
        fieldErrors.confirmPassword?.[0] ??
        fieldErrors.token?.[0] ??
        "Invalid input";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const result = await resetPasswordWithToken({
      token: parsed.data.token,
      password: parsed.data.password,
    });

    if (!result.success) {
      const messages = {
        missing: "No reset token was provided.",
        invalid: "This reset link is invalid or has already been used.",
        expired: "This reset link has expired.",
      } as const;

      return NextResponse.json(
        { error: messages[result.error], code: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your password has been updated. You can sign in now.",
    });
  } catch (error) {
    return handleRouteError(error, { category: "auth_reset_password" });
  }
}
