import "server-only";

import { getOrCreateDailyOracleForUser } from "@/lib/daily-oracle/service";
import { getDailyStreakForUser } from "@/lib/daily-oracle/streak";
import {
  buildUnsubscribeUrl,
  canSendLifecycleEmail,
  ensureUnsubscribeToken,
} from "@/lib/email/preferences";
import { greetingName } from "@/lib/email/personalization";
import {
  sendLifecycleEmail,
  startOfUtcDay,
} from "@/lib/email/send";
import {
  escapeHtml,
  renderEmailLayout,
  renderReadingCard,
} from "@/lib/email/templates/layout";
import { getAppUrl } from "@/lib/email/client";
import { prisma } from "@/lib/prisma";

export async function sendDailyOracleEmail(userId: string) {
  if (!(await canSendLifecycleEmail(userId, "emailDailyGuidance"))) {
    return { ok: false as const, reason: "opt_out" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, preferredLanguage: true },
  });
  if (!user?.email) return { ok: false as const, reason: "no_email" };

  const oracle = await getOrCreateDailyOracleForUser(userId, undefined, {
    updateStreak: false,
  });
  const streak = await getDailyStreakForUser(userId);
  const token = await ensureUnsubscribeToken(userId);
  const dailyUrl = `${getAppUrl()}/daily?utm_source=email&utm_medium=daily_oracle`;
  const trackUrl = `${getAppUrl()}/api/email/track/click?type=daily_oracle&uid=${userId}`;

  const name = greetingName(user.name);
  const bodyHtml = `
    <p style="margin:0 0 16px;">Good morning, ${escapeHtml(name)}.</p>
    <p style="margin:0 0 16px;">The day opens gently. Here is a message from the oracle for you today.</p>
    ${renderReadingCard({
      title: `Hexagram ${oracle.hexagramNumber}`,
      theme: oracle.energyTheme ?? "Today's energy",
      excerpt: oracle.oracleMessage,
    })}
    ${streak > 1 ? `<p style="margin:16px 0 0;font-size:13px;color:#8b7ec8;">Your reflection streak: ${streak} days</p>` : ""}
  `;

  const html = renderEmailLayout({
    preheader: oracle.oracleMessage.slice(0, 120),
    title: "Your oracle message for today",
    bodyHtml,
    cta: { label: "Begin today's reading", href: trackUrl },
    footerNote: "One message each day — calm, brief, and yours alone.",
    unsubscribeUrl: buildUnsubscribeUrl(token),
  });

  const text = [
    `Good morning, ${name}.`,
    "",
    oracle.oracleMessage,
    "",
    `Begin today's reading: ${dailyUrl}`,
  ].join("\n");

  const result = await sendLifecycleEmail({
    userId,
    to: user.email,
    subject: "Your oracle message for today",
    html,
    text,
    type: "daily_oracle",
    duplicateSince: startOfUtcDay(),
  });

  if (result.ok) {
    await prisma.user.update({
      where: { id: userId },
      data: { lastDailyEmailAt: new Date() },
    });
  }

  return result;
}
