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

export async function sendWeeklyOracleEmail(userId: string) {
  if (!(await canSendWeeklyOracleEmail(userId))) {
    return { ok: false as const, reason: "opt_out" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!user?.email) return { ok: false as const, reason: "no_email" };

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
    footerNote: "One oracle each Monday — the same message for every subscriber.",
    unsubscribeUrl: preferencesUrl,
  });

  const text = renderWeeklyOracleEmailText(oracle, name, ctaUrl);

  const result = await sendLifecycleEmail({
    userId,
    to: user.email,
    subject: `Weekly Oracle — ${oracle.title}`,
    html,
    text,
    type: "weekly_oracle",
    duplicateSince: startOfUtcWeek(),
  });

  if (result.ok) {
    await prisma.user.update({
      where: { id: userId },
      data: { lastWeeklyOracleEmailAt: new Date() },
    });
  }

  return result;
}
