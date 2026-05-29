import "server-only";

import {
  buildUnsubscribeUrl,
  canSendLifecycleEmail,
  ensureUnsubscribeToken,
} from "@/lib/email/preferences";
import { greetingName } from "@/lib/email/personalization";
import { sendLifecycleEmail, daysAgoUtc } from "@/lib/email/send";
import { escapeHtml, renderEmailLayout } from "@/lib/email/templates/layout";
import { getAppUrl } from "@/lib/email/client";
import { prisma } from "@/lib/prisma";

const TIERS = [
  {
    days: 3,
    tier: 3,
    subject: "The oracle has been quiet lately",
    title: "A gentle return",
    body: "Life moves quickly. When you have a moment, the oracle offers a space to pause — without urgency, without judgment.",
    cta: "Visit today's oracle",
  },
  {
    days: 7,
    tier: 7,
    subject: "A new insight may be waiting",
    title: "When you are ready",
    body: "Sometimes distance brings clarity. If something is still on your heart, a single question can reopen the conversation with your inner guide.",
    cta: "Ask the oracle",
  },
  {
    days: 14,
    tier: 14,
    subject: "Your path is still here",
    title: "The door remains open",
    body: "You do not need to catch up — only to return when the moment feels right. The oracle remembers nothing but the present question.",
    cta: "Begin a reading",
  },
] as const;

export async function sendReengagementEmail(
  userId: string,
  tierDays: 3 | 7 | 14,
) {
  if (!(await canSendLifecycleEmail(userId, "emailReengagement"))) {
    return { ok: false as const, reason: "opt_out" };
  }

  const tier = TIERS.find((t) => t.days === tierDays);
  if (!tier) return { ok: false as const, reason: "invalid_tier" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      lastReengagementTier: true,
      lastReengagementEmailAt: true,
    },
  });
  if (!user?.email) return { ok: false as const, reason: "no_email" };

  if (
    user.lastReengagementTier &&
    user.lastReengagementTier >= tier.tier &&
    user.lastReengagementEmailAt &&
    user.lastReengagementEmailAt > daysAgoUtc(7)
  ) {
    return { ok: false as const, reason: "already_sent_tier" };
  }

  const token = await ensureUnsubscribeToken(userId);
  const trackUrl = `${getAppUrl()}/api/email/track/click?type=reengagement_${tier.tier}d&uid=${userId}`;

  const bodyHtml = `
    <p style="margin:0 0 16px;">${escapeHtml(greetingName(user.name))},</p>
    <p style="margin:0;">${escapeHtml(tier.body)}</p>
  `;

  const html = renderEmailLayout({
    title: tier.title,
    bodyHtml,
    cta: { label: tier.cta, href: trackUrl },
    unsubscribeUrl: buildUnsubscribeUrl(token),
  });

  const result = await sendLifecycleEmail({
    userId,
    to: user.email,
    subject: tier.subject,
    html,
    text: `${tier.body}\n\n${getAppUrl()}/reading/guided`,
    type: `reengagement_${tier.tier}d`,
    duplicateSince: daysAgoUtc(tier.days - 1),
  });

  if (result.ok) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastReengagementEmailAt: new Date(),
        lastReengagementTier: tier.tier,
      },
    });
  }

  return result;
}

export async function findReengagementCandidates(
  tierDays: 3 | 7 | 14,
  limit = 100,
) {
  const tier = TIERS.find((t) => t.days === tierDays)!;
  const inactiveSince = daysAgoUtc(tier.days);
  const notTooOld = daysAgoUtc(tier.days + 7);

  const users = await prisma.user.findMany({
    where: {
      emailVerified: { not: null },
      emailGlobalUnsubscribedAt: null,
      emailReengagement: true,
      OR: [
        { lastActivityAt: { lte: inactiveSince } },
        {
          lastActivityAt: null,
          createdAt: { lte: inactiveSince },
        },
      ],
    },
    select: { id: true, lastActivityAt: true, createdAt: true, lastReengagementTier: true },
    take: limit * 2,
  });

  return users
    .filter((u) => {
      const last = u.lastActivityAt ?? u.createdAt;
      return last <= inactiveSince && last >= notTooOld;
    })
    .filter((u) => !u.lastReengagementTier || u.lastReengagementTier < tier.tier)
    .slice(0, limit);
}
