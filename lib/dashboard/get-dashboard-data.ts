import type { DashboardData } from "@/types/reading";
import { prisma } from "@/lib/prisma";

const RECENT_READINGS_LIMIT = 10;

/**
 * Load dashboard data for a user. Returns null if the user record does not exist.
 */
export async function getDashboardData(
  userId: string,
): Promise<DashboardData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    return null;
  }

  const readings = await prisma.reading.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: RECENT_READINGS_LIMIT,
    select: {
      id: true,
      question: true,
      hexagram: true,
      changingLines: true,
      transformedHexagram: true,
      createdAt: true,
    },
  });

  return { user, readings };
}
