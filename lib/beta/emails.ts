import "server-only";

import { getResendClient, getEmailFrom, getAppUrl } from "@/lib/email/client";
import { renderEmailLayout } from "@/lib/email/templates/layout";

export async function sendWaitlistConfirmationEmail(
  email: string,
  name: string | undefined,
  position: number,
): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;

  const greeting = name?.trim() ? name.trim().split(/\s+/)[0] : "Seeker";
  const bodyHtml = `
    <p style="margin:0 0 16px;">Hello ${greeting},</p>
    <p style="margin:0 0 16px;">Thank you for requesting access to the I Ching Oracle private beta.</p>
    <p style="margin:0;">You are on the early access list. We will reach out personally when a spot opens — no noise, no spam.</p>
  `;

  const html = renderEmailLayout({
    title: "You're on the beta waitlist",
    bodyHtml,
    footerNote: position > 0 ? `Your place in line: #${position}` : undefined,
  });

  await resend.emails.send({
    from: getEmailFrom(),
    to: email,
    subject: "You're on the I Ching Oracle beta waitlist",
    html,
    text: `Hello ${greeting},\n\nYou're on the private beta waitlist. We'll be in touch when your invite is ready.\n\n${getAppUrl()}/beta`,
  });
}

export async function sendBetaInviteEmail(
  email: string,
  code: string,
  name?: string,
): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;

  const greeting = name?.trim() ? name.trim().split(/\s+/)[0] : "Seeker";
  const registerUrl = `${getAppUrl()}/register?code=${encodeURIComponent(code)}`;
  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting},</p>
    <p style="margin:0 0 16px;">A spot has opened in the private beta. The oracle is ready when you are.</p>
    <p style="margin:0;font-family:monospace;font-size:18px;color:#e8d5a8;letter-spacing:0.1em;">${code}</p>
  `;

  const html = renderEmailLayout({
    title: "Your beta invite",
    bodyHtml,
    cta: { label: "Accept invite", href: registerUrl },
    footerNote: "This invite is personal — please do not share publicly.",
  });

  await resend.emails.send({
    from: getEmailFrom(),
    to: email,
    subject: "Your private beta invite — I Ching Oracle",
    html,
    text: `Your beta invite code: ${code}\n\nRegister: ${registerUrl}`,
  });
}

export async function sendBetaWelcomeEmail(
  email: string,
  name?: string,
): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;

  const greeting = name?.trim() ? name.trim().split(/\s+/)[0] : "Seeker";
  const bodyHtml = `
    <p style="margin:0 0 16px;">Welcome, ${greeting}.</p>
    <p style="margin:0 0 16px;">You are now among the first explorers of this reflective AI experience. Take your time — ask one honest question and see what emerges.</p>
    <p style="margin:0;">Your feedback shapes what we build next.</p>
  `;

  const html = renderEmailLayout({
    title: "Welcome, early explorer",
    bodyHtml,
    cta: { label: "Begin your first reading", href: `${getAppUrl()}/reading/guided` },
  });

  await resend.emails.send({
    from: getEmailFrom(),
    to: email,
    subject: "Welcome to the I Ching Oracle beta",
    html,
    text: `Welcome, ${greeting}. Begin: ${getAppUrl()}/reading/guided`,
  });
}

export async function sendFeedbackThankYouEmail(
  email: string,
  name?: string,
): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;

  const greeting = name?.trim() ? name.trim().split(/\s+/)[0] : "Explorer";
  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting},</p>
    <p style="margin:0 0 16px;">Thank you for sharing feedback on the beta. Every note is read by the team and shapes what we build next.</p>
    <p style="margin:0;">With gratitude for helping us refine the oracle.</p>
  `;

  const html = renderEmailLayout({
    title: "We received your feedback",
    bodyHtml,
    cta: { label: "Return to the oracle", href: `${getAppUrl()}/dashboard` },
  });

  await resend.emails.send({
    from: getEmailFrom(),
    to: email,
    subject: "Thank you — your beta feedback matters",
    html,
    text: `Thank you for your beta feedback, ${greeting}.`,
  });
}
