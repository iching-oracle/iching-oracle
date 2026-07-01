import "server-only";

import {
  buildPreferencesUrl,
  canSendLifecycleEmail,
  ensureUnsubscribeToken,
} from "@/lib/email/preferences";
import { greetingName } from "@/lib/email/personalization";
import { sendLifecycleEmail } from "@/lib/email/send";
import { escapeHtml, renderEmailLayout, renderReadingCard } from "@/lib/email/templates/layout";
import { getAppUrl } from "@/lib/email/client";
import { prisma } from "@/lib/prisma";
import { getHexagram, getRandomHexagramNumber } from "@/lib/hexagrams";

const SUBJECT_LINES = [
  "Your weekly I Ching reflection",
  "Your guidance for the week",
  "A quiet moment with the I Ching",
];

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

function getRandomSubject(): string {
  return SUBJECT_LINES[Math.floor(Math.random() * SUBJECT_LINES.length)];
}

async function getUserStreak(userId: string): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyStreak: true },
  });
  return user?.dailyStreak ?? null;
}

async function getLastWeekReading(userId: string): Promise<{ hexagramName: string } | null> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const reading = await prisma.reading.findFirst({
    where: {
      userId,
      createdAt: { gte: weekAgo },
    },
    orderBy: { createdAt: "desc" },
    select: { primaryHexagramName: true },
  });

  if (!reading?.primaryHexagramName) return null;
  return { hexagramName: reading.primaryHexagramName };
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

  const token = await ensureUnsubscribeToken(userId);
  const trackUrl = `${getAppUrl()}/api/email/track/click?type=weekly_reflection&uid=${userId}`;
  const hexagramNumber = getRandomHexagramNumber();
  const hexagram = getHexagram(hexagramNumber);
  const streak = await getUserStreak(userId);
  const lastWeekReading = await getLastWeekReading(userId);

  const bodyHtmlParts: string[] = [];

  bodyHtmlParts.push(`
    <p style="margin:0 0 16px;">Hi ${escapeHtml(greetingName(user.name))},</p>
    <p style="margin:0 0 20px;">Take a quiet moment this week to reflect before beginning your reading.</p>
  `);

  if (streak && streak > 0) {
    bodyHtmlParts.push(`
      <p style="margin:0 0 16px;padding:12px;background:rgba(197,160,89,0.08);border:1px solid rgba(197,160,89,0.2);border-radius:8px;">
        <strong style="color:#c5a059;">You're on a ${streak}-week reflection journey.</strong>
      </p>
    `);
  }

  if (lastWeekReading) {
    bodyHtmlParts.push(`
      <p style="margin:0 0 16px;font-size:14px;color:#9a96a8;">
        Last week you explored: <strong style="color:#e8d5a8;">${escapeHtml(lastWeekReading.hexagramName)}</strong>
      </p>
    `);
  }

  bodyHtmlParts.push(renderReadingCard({
    theme: `Hexagram ${hexagramNumber} · ${hexagram.chineseName}`,
    title: hexagram.englishName,
    excerpt: hexagram.judgment,
  }));

  const bodyHtml = bodyHtmlParts.join("");

  const html = renderEmailLayout({
    preheader: hexagram.judgment.slice(0, 120),
    title: "Your weekly reflection",
    bodyHtml,
    cta: { label: "Begin This Week's Reading", href: trackUrl },
    footerNote: "One reflection each week. No noise. Just wisdom when you need it.",
    unsubscribeUrl: buildPreferencesUrl(token),
  });

  const textParts: string[] = [
    `Hi ${greetingName(user.name)},`,
    "",
    "Take a quiet moment this week to reflect before beginning your reading.",
    "",
  ];

  if (streak && streak > 0) {
    textParts.push(`You're on a ${streak}-week reflection journey.`);
    textParts.push("");
  }

  if (lastWeekReading) {
    textParts.push(`Last week you explored: ${lastWeekReading.hexagramName}`);
    textParts.push("");
  }

  textParts.push(
    `Hexagram ${hexagramNumber} · ${hexagram.chineseName}`,
    hexagram.englishName,
    hexagram.judgment,
    "",
    `Begin This Week's Reading: ${getAppUrl()}`,
  );

  const text = textParts.join("\n");

  const result = await sendLifecycleEmail({
    userId,
    to: user.email,
    subject: getRandomSubject(),
    html,
    text,
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
