import "server-only";

import { prisma } from "@/lib/prisma";
import { getEmailFrom, getResendClient, getAppUrl } from "@/lib/email/client";
import { buildUnsubscribeUrl, ensureUnsubscribeToken } from "@/lib/email/preferences";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server";
import { logSystemEvent } from "@/lib/monitoring/logger";

export type SendEmailInput = {
  userId: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  type: string;
  /** Skip duplicate check when true (e.g. transactional) */
  skipDuplicateCheck?: boolean;
  duplicateSince?: Date;
};

export type SendEmailResult =
  | { ok: true; logId: string; resendId?: string }
  | { ok: false; reason: string };

export async function sendLifecycleEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const resend = getResendClient();
  if (!resend) {
    return { ok: false, reason: "RESEND_API_KEY not configured" };
  }

  if (!input.skipDuplicateCheck && input.duplicateSince) {
    const existing = await prisma.emailSendLog.findFirst({
      where: {
        userId: input.userId,
        type: input.type,
        createdAt: { gte: input.duplicateSince },
      },
    });
    if (existing) {
      return { ok: false, reason: "duplicate" };
    }
  }

  const token = await ensureUnsubscribeToken(input.userId);
  const unsubUrl = buildUnsubscribeUrl(token);

  let html = input.html;
  if (!html.includes(unsubUrl)) {
    /* layout should include unsubscribe; append fallback */
    html = html.replace(
      "</body>",
      `<p style="text-align:center;font-size:11px;color:#666;"><a href="${unsubUrl}">Unsubscribe</a></p></body>`,
    );
  }

  const pixelUrl = `${getAppUrl()}/api/email/track/open?uid=${encodeURIComponent(input.userId)}&type=${encodeURIComponent(input.type)}`;
  html = html.replace(
    "</body>",
    `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;margin:0;padding:0;" /></body>`,
  );

  const { data, error } = await resend.emails.send({
    from: getEmailFrom(),
    to: input.to,
    subject: input.subject,
    html,
    text: input.text,
    headers: {
      "List-Unsubscribe": `<${unsubUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  if (error) {
    await logSystemEvent({
      level: "error",
      category: "email_send",
      message: error.message ?? "Resend send failed",
      userId: input.userId,
      metadata: { type: input.type, to: input.to },
    });
    return { ok: false, reason: error.message ?? "send_failed" };
  }

  const log = await prisma.emailSendLog.create({
    data: {
      userId: input.userId,
      type: input.type,
      resendId: data?.id,
      subject: input.subject,
    },
  });

  await trackServerEvent(ANALYTICS_EVENTS.EMAIL_SENT, {
    userId: input.userId,
    properties: {
      email_type: input.type,
      log_id: log.id,
    },
  });

  return { ok: true, logId: log.id, resendId: data?.id };
}

export function startOfUtcDay(date = new Date()): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function daysAgoUtc(days: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}
