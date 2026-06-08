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
    <p style="margin:0 0 20px;">Your access to I Ching Oracle is almost ready. Confirm your email to complete your invitation and begin.</p>
  `;

  const html = renderEmailLayout({
    title: "Confirm your invitation",
    bodyHtml,
    cta: { label: "Confirm access", href: verifyUrl },
    footerNote: "This link expires in 24 hours. If you did not request access, you may safely ignore this email.",
  });

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: email,
    subject: "Your access to I Ching Oracle",
    html,
    text: [
      "Your access to I Ching Oracle",
      "",
      "Confirm your email to complete your invitation.",
      "",
      `Confirm access: ${verifyUrl}`,
      "",
      "This link expires in 24 hours.",
    ].join("\n"),
  });

  if (error) {
    console.error("[email] Resend error", error);
    throw new Error(error.message ?? "Failed to send verification email.");
  }
}
