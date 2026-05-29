import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";
import { generateVerificationToken, getVerificationTokenExpiry } from "@/lib/tokens";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server";
import {
  RATE_LIMITS,
  rateLimitByIp,
  rateLimitResponse,
} from "@/lib/rate-limit/presets";
import { handleRouteError } from "@/lib/errors/api";

export async function POST(request: Request) {
  const limited = await rateLimitByIp(request, "register", RATE_LIMITS.register);
  if (!limited.ok) {
    return rateLimitResponse(limited);
  }

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const message =
        fieldErrors.name?.[0] ??
        fieldErrors.email?.[0] ??
        fieldErrors.password?.[0] ??
        fieldErrors.confirmPassword?.[0] ??
        "Invalid input";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This email is already registered" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = getVerificationTokenExpiry();

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        emailVerified: null,
        verificationToken,
        verificationTokenExpires,
      },
    });

    try {
      await sendVerificationEmail(normalizedEmail, verificationToken);
    } catch (emailError) {
      console.error("[register] Verification email failed", emailError);
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        {
          error:
            "Could not send verification email. Please check your email address and try again.",
        },
        { status: 503 },
      );
    }

    await trackServerEvent(ANALYTICS_EVENTS.USER_SIGNED_UP, {
      userId: user.id,
      properties: { source: "credentials" },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Please check your email and click the verification link to activate your account.",
      },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error, {
      category: "register",
      path: "/api/register",
    });
  }
}
