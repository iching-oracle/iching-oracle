import "server-only";

import {
  buildUnsubscribeUrl,
  canSendLifecycleEmail,
  ensureUnsubscribeToken,
} from "@/lib/email/preferences";
import {
  buildWeeklyReflectionText,
  getUserEmailContext,
  greetingName,
} from "@/lib/email/personalization";
import { sendLifecycleEmail, startOfUtcDay } from "@/lib/email/send";
import { escapeHtml, renderEmailLayout } from "@/lib/email/templates/layout";
import { getAppUrl } from "@/lib/email/client";
import { prisma } from "@/lib/prisma";

function startOfUtcWeek(): Date {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

export async function sendWeeklyReflectionEmail(userId: string) {
  if (!(await canSendLifecycleEmail(userId, "emailWeeklyReflection"))) {
    return { ok: false as const, reason: "opt_out" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!user?.email) return { ok: false as const, reason: "no_email" };

  const ctx = await getUserEmailContext(userId);
  if (!ctx) return { ok: false as const, reason: "no_context" };

  const reflection = buildWeeklyReflectionText(ctx);
  const token = await ensureUnsubscribeToken(userId);
  const guidedUrl = `${getAppUrl()}/reading/guided?utm_source=email&utm_medium=weekly_reflection`;
  const trackUrl = `${getAppUrl()}/api/email/track/click?type=weekly_reflection&uid=${userId}`;

  const bodyHtml = `
    <p style="margin:0 0 16px;">Hello ${escapeHtml(greetingName(user.name))},</p>
    <p style="margin:0 0 16px;">As the week turns, a pattern may be asking for your attention.</p>
    <p style="margin:0;font-style:italic;color:#d4cfc4;">${escapeHtml(reflection)}</p>
  `;

  const html = renderEmailLayout({
    preheader: reflection.slice(0, 120),
    title: "Your weekly reflection",
    bodyHtml,
    cta: { label: "Continue your journey", href: trackUrl },
    footerNote: "Sent once per week when you have opted in.",
    unsubscribeUrl: buildUnsubscribeUrl(token),
  });

  const result = await sendLifecycleEmail({
    userId,
    to: user.email,
    subject: "A pattern in your recent readings",
    html,
    text: `${reflection}\n\nContinue: ${guidedUrl}`,
    type: "weekly_reflection",
    duplicateSince: startOfUtcWeek(),
  });

  if (result.ok) {
    await prisma.user.update({
      where: { id: userId },
      data: { lastWeeklyEmailAt: new Date() },
    });
  }

  return result;
}
