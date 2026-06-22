import "server-only";

import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/email/client";
import type { EmailPreferenceKey } from "@/lib/email/pref-labels";
export type { EmailPreferenceKey } from "@/lib/email/pref-labels";
export { EMAIL_PREF_LABELS } from "@/lib/email/pref-labels";

export async function ensureUnsubscribeToken(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailUnsubscribeToken: true },
  });
  if (user?.emailUnsubscribeToken) return user.emailUnsubscribeToken;

  const token = randomBytes(32).toString("hex");
  await prisma.user.update({
    where: { id: userId },
    data: { emailUnsubscribeToken: token },
  });
  return token;
}

export function buildUnsubscribeUrl(token: string): string {
  return `${getAppUrl()}/unsubscribe/${token}`;
}

export function buildPreferencesUrl(token: string): string {
  return `${getAppUrl()}/settings/notifications?token=${token}`;
}

export async function canSendLifecycleEmail(
  userId: string,
  prefKey: EmailPreferenceKey,
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      emailVerified: true,
      emailGlobalUnsubscribedAt: true,
      emailDailyGuidance: true,
      emailWeeklyReflection: true,
      emailReengagement: true,
      emailProductUpdates: true,
      emailMarketing: true,
    },
  });

  if (!user?.emailVerified) return false;
  if (user.emailGlobalUnsubscribedAt) return false;
  return Boolean(user[prefKey]);
}

export async function touchUserActivity(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { lastActivityAt: new Date() },
  });

  const { recordReengagementSuccess } = await import("@/lib/email/tracking");
  void recordReengagementSuccess(userId);
}

export async function getEmailPreferences(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      emailDailyGuidance: true,
      emailWeeklyReflection: true,
      emailReengagement: true,
      emailProductUpdates: true,
      emailMarketing: true,
      weeklyOracleEnabled: true,
      emailGlobalUnsubscribedAt: true,
      emailUnsubscribeToken: true,
    },
  });

  const token =
    user.emailUnsubscribeToken ?? (await ensureUnsubscribeToken(userId));

  return {
    ...user,
    emailUnsubscribeToken: token,
    globallyUnsubscribed: Boolean(user.emailGlobalUnsubscribedAt),
  };
}

export async function updateEmailPreferences(
  userId: string,
  prefs: Partial<Record<EmailPreferenceKey, boolean>>,
) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      ...prefs,
      emailGlobalUnsubscribedAt: null,
    },
  });
}

export async function updateWeeklyOracleEnabled(
  userId: string,
  enabled: boolean,
) {
  await prisma.user.update({
    where: { id: userId },
    data: enabled
      ? { weeklyOracleEnabled: true, emailGlobalUnsubscribedAt: null }
      : { weeklyOracleEnabled: false },
  });
}

export async function globalUnsubscribe(token: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { emailUnsubscribeToken: token },
    select: { id: true },
  });
  if (!user) return false;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailGlobalUnsubscribedAt: new Date(),
      emailDailyGuidance: false,
      emailWeeklyReflection: false,
      emailReengagement: false,
      emailProductUpdates: false,
      emailMarketing: false,
      weeklyOracleEnabled: false,
    },
  });
  return true;
}
