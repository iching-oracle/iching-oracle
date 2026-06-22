import "server-only";

import {
  buildPreferencesUrl,
  ensureUnsubscribeToken,
} from "@/lib/email/preferences";
import { greetingName } from "@/lib/email/personalization";
import { sendLifecycleEmail } from "@/lib/email/send";
import { renderEmailLayout } from "@/lib/email/templates/layout";
import {
  renderWeeklyOracleEmailBody,
  renderWeeklyOracleEmailText,
} from "@/lib/email/templates/weekly-oracle";
import { getAppUrl } from "@/lib/email/client";
import { prisma } from "@/lib/prisma";
import {
  generateWeeklyOracle,
  startOfUtcWeek,
} from "@/lib/weekly-oracle/generate";

export async function canSendWeeklyOracleEmail(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      emailVerified: true,
      emailGlobalUnsubscribedAt: true,
      weeklyOracleEnabled: true,
    },
  });

  if (!user?.emailVerified) return false;
  if (user.emailGlobalUnsubscribedAt) return false;
  return user.weeklyOracleEnabled;
}

export type SendWeeklyOracleEmailOptions = {
  /** Admin test only — override the recipient inbox. */
  toEmail?: string;
  /** Admin test only — skip opt-in, dedup, and last-sent tracking. */
  test?: boolean;
};

export type SendWeeklyOracleEmailResult =
  | { ok: true; logId: string; resendId?: string; oracle: ReturnType<typeof generateWeeklyOracle> }
  | { ok: false; reason: string; oracle?: ReturnType<typeof generateWeeklyOracle> };

export async function sendWeeklyOracleEmail(
  userId: string,
  options?: SendWeeklyOracleEmailOptions,
): Promise<SendWeeklyOracleEmailResult> {
  const isTest = options?.test === true;

  if (!isTest && !(await canSendWeeklyOracleEmail(userId))) {
    return { ok: false, reason: "opt_out" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!user?.email) return { ok: false, reason: "no_email" };

  const to = options?.toEmail?.trim().toLowerCase() ?? user.email;
  if (!to) return { ok: false, reason: "no_email" };

  const oracle = generateWeeklyOracle();
  const token = await ensureUnsubscribeToken(userId);
  const hexagramPath = `/hexagrams/${oracle.hexagramNumber}?utm_source=email&utm_medium=weekly_oracle`;
  const ctaUrl = `${getAppUrl()}${hexagramPath}`;
  const trackUrl = `${getAppUrl()}/api/email/track/click?type=weekly_oracle&uid=${userId}&dest=${encodeURIComponent(hexagramPath)}`;
  const preferencesUrl = buildPreferencesUrl(token);
  const name = greetingName(user.name);

  const bodyHtml = renderWeeklyOracleEmailBody(oracle, name);
  const html = renderEmailLayout({
    preheader: `${oracle.title}: ${oracle.message.slice(0, 80)}`,
    title: "Your Weekly Oracle",
    bodyHtml,
    cta: { label: "Read Full Interpretation", href: trackUrl },
    footerNote: isTest
      ? "Test send from admin — one oracle each Monday for subscribers."
      : "One oracle each Monday — the same message for every subscriber.",
    unsubscribeUrl: preferencesUrl,
  });

  const text = renderWeeklyOracleEmailText(oracle, name, ctaUrl);

  const result = await sendLifecycleEmail({
    userId,
    to,
    subject: isTest
      ? `[Test] Weekly Oracle — ${oracle.title}`
      : `Weekly Oracle — ${oracle.title}`,
    html,
    text,
    type: isTest ? "weekly_oracle_test" : "weekly_oracle",
    skipDuplicateCheck: isTest,
    duplicateSince: isTest ? undefined : startOfUtcWeek(),
  });

  if (result.ok && !isTest) {
    await prisma.user.update({
      where: { id: userId },
      data: { lastWeeklyOracleEmailAt: new Date() },
    });
  }

  if (result.ok) {
    return { ok: true, logId: result.logId, resendId: result.resendId, oracle };
  }

  return { ok: false, reason: result.reason, oracle };
}
