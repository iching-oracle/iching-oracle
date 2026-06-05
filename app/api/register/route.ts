import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";
import { isBetaInviteOnly } from "@/lib/beta/config";
import { sendBetaWelcomeEmail } from "@/lib/beta/emails";
import {
  INVITE_ERROR_MESSAGES,
  mapInviteRedeemError,
} from "@/lib/beta/invite-code";
import {
  createBetaUserWithInvite,
  validateInviteCode,
} from "@/lib/beta/invites";
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

function fieldError(
  message: string,
  field: string,
  status: number,
) {
  return NextResponse.json({ error: message, field }, { status });
}

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
      const field = fieldErrors.name
        ? "name"
        : fieldErrors.email
          ? "email"
          : fieldErrors.password
            ? "password"
            : fieldErrors.confirmPassword
              ? "confirmPassword"
              : fieldErrors.inviteCode
                ? "inviteCode"
                : undefined;
      const message =
        fieldErrors.name?.[0] ??
        fieldErrors.email?.[0] ??
        fieldErrors.password?.[0] ??
        fieldErrors.confirmPassword?.[0] ??
        fieldErrors.inviteCode?.[0] ??
        "Invalid input";
      return NextResponse.json({ error: message, field }, { status: 400 });
    }

    const { name, email, password, inviteCode } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return fieldError(
        "This email is already registered.",
        "email",
        409,
      );
    }

    let inviteId: string | undefined;
    if (isBetaInviteOnly()) {
      if (!inviteCode?.trim()) {
        return fieldError(
          INVITE_ERROR_MESSAGES.REQUIRED,
          "inviteCode",
          403,
        );
      }
      const inviteCheck = await validateInviteCode(inviteCode, normalizedEmail);
      if (!inviteCheck.ok) {
        return fieldError(inviteCheck.reason, "inviteCode", 403);
      }
      inviteId = inviteCheck.inviteId;
    } else if (inviteCode?.trim()) {
      const inviteCheck = await validateInviteCode(inviteCode, normalizedEmail);
      if (!inviteCheck.ok) {
        return fieldError(inviteCheck.reason, "inviteCode", 403);
      }
      inviteId = inviteCheck.inviteId;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = getVerificationTokenExpiry();

    let userId: string;

    if (inviteId) {
      try {
        const result = await createBetaUserWithInvite({
          inviteId,
          name: name?.trim() || null,
          email: normalizedEmail,
          passwordHash: hashedPassword,
          verificationToken,
          verificationTokenExpires,
        });
        userId = result.userId;
      } catch (inviteError) {
        return fieldError(
          mapInviteRedeemError(inviteError),
          "inviteCode",
          400,
        );
      }
    } else {
      const user = await prisma.user.create({
        data: {
          name: name?.trim() || null,
          email: normalizedEmail,
          password: hashedPassword,
          emailVerified: null,
          verificationToken,
          verificationTokenExpires,
        },
      });
      userId = user.id;
    }

    try {
      await sendVerificationEmail(normalizedEmail, verificationToken);
    } catch (emailError) {
      console.error("[register] Verification email failed", emailError);
      await prisma.user.delete({ where: { id: userId } });
      if (inviteId) {
        await prisma.inviteCode.update({
          where: { id: inviteId },
          data: { usedCount: { decrement: 1 } },
        });
      }
      return NextResponse.json(
        {
          error:
            "Could not send verification email. Please check your email address and try again.",
          field: "email",
        },
        { status: 503 },
      );
    }

    if (inviteId) {
      void sendBetaWelcomeEmail(normalizedEmail, name?.trim());
      await trackServerEvent(ANALYTICS_EVENTS.BETA_INVITE_REDEEMED, {
        userId,
        properties: { source: "credentials" },
      });
    }

    await trackServerEvent(ANALYTICS_EVENTS.USER_SIGNED_UP, {
      userId,
      properties: { source: "credentials" },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Your account is ready. Check your email for a quiet confirmation link.",
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
