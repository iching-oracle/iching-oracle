import "server-only";

import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server";
import { prisma } from "@/lib/prisma";

const CLICK_DESTINATIONS: Record<string, string> = {
  daily_oracle: "/daily?utm_source=email&utm_medium=daily_oracle",
  weekly_reflection: "?utm_source=email&utm_medium=weekly_reflection",
  weekly_oracle: "/hexagrams?utm_source=email&utm_medium=weekly_oracle",
  reengagement_3d: "/reading/guided?utm_source=email&utm_medium=reengagement_3d",
  reengagement_7d: "/reading/guided?utm_source=email&utm_medium=reengagement_7d",
  reengagement_14d: "/reading/guided?utm_source=email&utm_medium=reengagement_14d",
};

export function getClickDestination(type: string): string | null {
  return CLICK_DESTINATIONS[type] ?? null;
}

async function findRecentLog(userId: string, type: string) {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 14);

  return prisma.emailSendLog.findFirst({
    where: { userId, type, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
  });
}

export async function recordEmailOpen(
  userId: string,
  type: string,
): Promise<void> {
  const log = await findRecentLog(userId, type);
  if (!log || log.openedAt) return;

  await prisma.emailSendLog.update({
    where: { id: log.id },
    data: { openedAt: new Date() },
  });

  await trackServerEvent(ANALYTICS_EVENTS.EMAIL_OPENED, {
    userId,
    properties: { email_type: type, log_id: log.id },
  });
}

export async function recordEmailClick(
  userId: string,
  type: string,
): Promise<string | null> {
  const log = await findRecentLog(userId, type);
  const destination = getClickDestination(type);

  if (log && !log.clickedAt) {
    await prisma.emailSendLog.update({
      where: { id: log.id },
      data: { clickedAt: new Date() },
    });

    await trackServerEvent(ANALYTICS_EVENTS.EMAIL_CLICKED, {
      userId,
      properties: { email_type: type, log_id: log.id },
    });
  }

  return destination;
}

export async function recordReengagementSuccess(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastReengagementEmailAt: true },
  });
  if (!user?.lastReengagementEmailAt) return;

  const hoursSince =
    (Date.now() - user.lastReengagementEmailAt.getTime()) / (1000 * 60 * 60);
  if (hoursSince > 72) return;

  const recentClick = await prisma.emailSendLog.findFirst({
    where: {
      userId,
      type: { startsWith: "reengagement_" },
      clickedAt: { not: null },
      createdAt: { gte: user.lastReengagementEmailAt },
    },
  });
  if (!recentClick) return;

  await trackServerEvent(ANALYTICS_EVENTS.REENGAGEMENT_SUCCESS, {
    userId,
    properties: { email_type: recentClick.type },
  });
}
