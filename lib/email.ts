import "server-only";

import { getAppUrl, getEmailFrom, getResendClient } from "@/lib/email/client";
import { escapeHtml, renderEmailLayout } from "@/lib/email/templates/layout";

export { getAppUrl };

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const verifyUrl = `${getAppUrl()}/verify-email?token=${encodeURIComponent(token)}`;

  const bodyHtml = `
    <p style="margin:0 0 20px;">Welcome to the oracle. Please verify your email address to activate your account and begin your I Ching journey.</p>
  `;

  const html = renderEmailLayout({
    title: "Confirm your account",
    bodyHtml,
    cta: { label: "Verify email", href: verifyUrl },
    footerNote: "This link expires in 24 hours. If you did not create an account, you can safely ignore this email.",
  });

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: email,
    subject: "Confirm your I Ching Oracle account",
    html,
    text: [
      "Confirm your I Ching Oracle account",
      "",
      "Welcome to the oracle. Please verify your email address to activate your account.",
      "",
      `Verify your email: ${verifyUrl}`,
      "",
      "This link expires in 24 hours.",
    ].join("\n"),
  });

  if (error) {
    console.error("[email] Resend error", error);
    throw new Error(error.message ?? "Failed to send verification email.");
  }
}
