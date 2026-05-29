import "server-only";

import { prisma } from "@/lib/prisma";

export type RetentionDashboardStats = {
  dailyStreak: number;
  lastDailyVisit: Date | null;
  daysSinceLastReading: number | null;
  readingCount: number;
};

export async function getRetentionDashboardStats(
  userId: string,
): Promise<RetentionDashboardStats> {
  const [user, latestReading, readingCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { dailyStreak: true, lastDailyVisit: true },
    }),
    prisma.reading.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.reading.count({ where: { userId } }),
  ]);

  let daysSinceLastReading: number | null = null;
  if (latestReading) {
    const ms = Date.now() - latestReading.createdAt.getTime();
    daysSinceLastReading = Math.floor(ms / (1000 * 60 * 60 * 24));
  }

  return {
    dailyStreak: user?.dailyStreak ?? 0,
    lastDailyVisit: user?.lastDailyVisit ?? null,
    daysSinceLastReading,
    readingCount,
  };
}
