import "server-only";

import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "@/lib/email/password-reset";
import { hashPasswordResetToken } from "@/lib/auth/password-reset-crypto";
import {
  generatePasswordResetToken,
  getPasswordResetTokenExpiry,
  isPasswordResetTokenExpired,
} from "@/lib/tokens";
import { prisma } from "@/lib/prisma";

export type PasswordResetTokenStatus =
  | { valid: true; userId: string }
  | { valid: false; error: "missing" | "invalid" | "expired" };

const GENERIC_RESET_MESSAGE =
  "If an account with that email exists, we have sent a password reset link.";

export function getGenericResetMessage(): string {
  return GENERIC_RESET_MESSAGE;
}

export async function requestPasswordReset(
  email: string,
): Promise<{ sent: boolean; message: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      password: true,
    },
  });

  // Prevent email enumeration — same response whether or not account exists
  if (!user?.password) {
    return { sent: true, message: GENERIC_RESET_MESSAGE };
  }

  const rawToken = generatePasswordResetToken();
  const passwordResetTokenHash = hashPasswordResetToken(rawToken);
  const passwordResetExpires = getPasswordResetTokenExpiry();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetTokenHash,
      passwordResetExpires,
    },
  });

  try {
    await sendPasswordResetEmail(user.email, rawToken);
    return { sent: true, message: GENERIC_RESET_MESSAGE };
  } catch (error) {
    console.error("[password-reset] Send failed", error);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: null,
        passwordResetExpires: null,
      },
    });
    return { sent: false, message: GENERIC_RESET_MESSAGE };
  }
}

export async function validatePasswordResetToken(
  token: string | null | undefined,
): Promise<PasswordResetTokenStatus> {
  const trimmed = token?.trim();
  if (!trimmed) {
    return { valid: false, error: "missing" };
  }

  const hash = hashPasswordResetToken(trimmed);

  const user = await prisma.user.findUnique({
    where: { passwordResetTokenHash: hash },
    select: {
      id: true,
      passwordResetExpires: true,
    },
  });

  if (!user) {
    return { valid: false, error: "invalid" };
  }

  if (isPasswordResetTokenExpired(user.passwordResetExpires)) {
    return { valid: false, error: "expired" };
  }

  return { valid: true, userId: user.id };
}

export async function resetPasswordWithToken(params: {
  token: string;
  password: string;
}): Promise<
  | { success: true }
  | { success: false; error: "missing" | "invalid" | "expired" }
> {
  const status = await validatePasswordResetToken(params.token);
  if (!status.valid) {
    return { success: false, error: status.error };
  }

  const hashedPassword = await bcrypt.hash(params.password, 12);

  await prisma.user.update({
    where: { id: status.userId },
    data: {
      password: hashedPassword,
      passwordResetTokenHash: null,
      passwordResetExpires: null,
    },
  });

  return { success: true };
}
