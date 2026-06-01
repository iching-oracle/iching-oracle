import "server-only";

import { getResendClient } from "@/lib/email/client";
import { escapeHtml, renderEmailLayout } from "@/lib/email/templates/layout";

export const PASSWORD_RESET_FROM =
  "I Ching Oracle <noreply@contact.ichingoracle.de>";

export function getPasswordResetUrl(token: string): string {
  const base =
    process.env.PASSWORD_RESET_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    "https://www.ichingoracle.de";

  return `${base.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const resetUrl = getPasswordResetUrl(token);

  const bodyHtml = `
    <p style="margin:0 0 16px;">We received a request to reset the password for your I Ching Oracle account.</p>
    <p style="margin:0 0 20px;">If you made this request, use the button below to choose a new password. This link is valid for <strong style="color:#e8d5a8;">one hour</strong> and can only be used once.</p>
    <p style="margin:0;font-size:13px;color:#8b8798;">If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.</p>
  `;

  const html = renderEmailLayout({
    preheader: "Reset your I Ching Oracle password",
    title: "Reset your password",
    bodyHtml,
    cta: { label: "Choose new password", href: resetUrl },
    footerNote:
      "This link expires in 1 hour. For your security, never share this email.",
  });

  const from =
    process.env.PASSWORD_RESET_FROM?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    process.env.EMAIL_FROM_ADDRESS?.trim() ||
    PASSWORD_RESET_FROM;

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: "Reset your I Ching Oracle password",
    html,
    text: [
      "Reset your I Ching Oracle password",
      "",
      "We received a request to reset your password.",
      "",
      `Choose a new password: ${resetUrl}`,
      "",
      "This link expires in 1 hour and can only be used once.",
      "",
      "If you did not request this, ignore this email.",
    ].join("\n"),
  });

  if (error) {
    console.error("[email] Password reset send failed", error);
    throw new Error(error.message ?? "Failed to send password reset email.");
  }
}
