import "server-only";

import { parseDateOnly } from "@/lib/daily-oracle/seed";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server";
import { prisma } from "@/lib/prisma";

function daysBetween(a: Date, b: Date): number {
  const ms = parseDateOnly(b.toISOString().slice(0, 10)).getTime() -
    parseDateOnly(a.toISOString().slice(0, 10)).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

export async function updateDailyStreakForUser(
  userId: string,
  dateKey: string,
): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyStreak: true, lastDailyVisit: true },
  });

  if (!user) return 0;

  const today = parseDateOnly(dateKey);
  let streak = user.dailyStreak;

  if (!user.lastDailyVisit) {
    streak = 1;
  } else {
    const gap = daysBetween(user.lastDailyVisit, today);
    if (gap === 0) {
      streak = Math.max(streak, 1);
    } else if (gap === 1) {
      streak = streak + 1;
    } else {
      if (user.dailyStreak > 1) {
        void trackServerEvent(ANALYTICS_EVENTS.STREAK_RESTORED, {
          userId,
          properties: { previous_streak: user.dailyStreak },
        });
      }
      streak = 1;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      dailyStreak: streak,
      lastDailyVisit: today,
    },
  });

  return streak;
}

export async function getDailyStreakForUser(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyStreak: true },
  });
  return user?.dailyStreak ?? 0;
}
