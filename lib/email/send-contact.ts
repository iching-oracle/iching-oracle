import "server-only";

import { getEmailFrom, getResendClient } from "@/lib/email/client";
import { getContactInboxEmail } from "@/lib/email/contact-inbox";
import {
  renderContactMessageEmail,
  type ContactMessageEmailInput,
} from "@/lib/email/templates/contact-message";

export type SendContactEmailResult =
  | { ok: true; resendId?: string }
  | { ok: false; reason: string };

export async function sendContactFormEmail(
  input: ContactMessageEmailInput,
): Promise<SendContactEmailResult> {
  const resend = getResendClient();
  if (!resend) {
    return { ok: false, reason: "RESEND_API_KEY not configured" };
  }

  const to = getContactInboxEmail();
  const { html, text, subject } = renderContactMessageEmail(input);

  const { data, error } = await resend.emails.send({
    from: getEmailFrom(),
    to,
    replyTo: input.email,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("[email/contact] Resend error", error);
    return { ok: false, reason: error.message ?? "send_failed" };
  }

  return { ok: true, resendId: data?.id };
}
