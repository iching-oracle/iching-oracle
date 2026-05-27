import "server-only";

import { prisma } from "@/lib/prisma";

export async function getAdminOverviewStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    premiumUsers,
    totalReadings,
    readings30d,
    waitlistCount,
    openTickets,
    recentErrors,
    aiUsage30d,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        OR: [
          { subscriptionStatus: "active" },
          { premiumUntil: { gt: now } },
        ],
      },
    }),
    prisma.reading.count(),
    prisma.reading.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.waitlistEntry.count(),
    prisma.supportTicket.count({ where: { status: "open" } }),
    prisma.systemEvent.count({
      where: { level: "error", createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.aIUsage.aggregate({
      where: { createdAt: { gte: thirtyDaysAgo } },
      _sum: { creditsUsed: true, estimatedTokenUsage: true },
      _count: true,
    }),
  ]);

  const readingsByDay = await prisma.$queryRaw<
    Array<{ day: Date; count: bigint }>
  >`
    SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::bigint AS count
    FROM "Reading"
    WHERE "createdAt" >= ${thirtyDaysAgo}
    GROUP BY 1
    ORDER BY 1 ASC
  `;

  const topFeatures = await prisma.aIUsage.groupBy({
    by: ["featureType"],
    where: { createdAt: { gte: thirtyDaysAgo } },
    _sum: { creditsUsed: true },
    _count: true,
    orderBy: { _count: { featureType: "desc" } },
    take: 8,
  });

  return {
    totalUsers,
    premiumUsers,
    totalReadings,
    readings30d,
    waitlistCount,
    openTickets,
    recentErrors,
    creditsUsed30d: aiUsage30d._sum.creditsUsed ?? 0,
    aiCalls30d: aiUsage30d._count,
    tokens30d: aiUsage30d._sum.estimatedTokenUsage ?? 0,
    readingsByDay: readingsByDay.map((r) => ({
      day: r.day.toISOString().slice(0, 10),
      count: Number(r.count),
    })),
    topFeatures: topFeatures.map((f) => ({
      feature: f.featureType,
      count: f._count,
      credits: f._sum.creditsUsed ?? 0,
    })),
  };
}

export async function getAdminUsers(limit = 50) {
  return prisma.user.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      subscriptionStatus: true,
      planType: true,
      credits: true,
      premiumUntil: true,
      _count: { select: { readings: true } },
    },
  });
}

export async function getAdminRecentReadings(limit = 40) {
  return prisma.reading.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      question: true,
      hexagram: true,
      category: true,
      interpretationPending: true,
      isPremiumReading: true,
      createdAt: true,
      user: { select: { email: true } },
    },
  });
}

export async function getAdminSystemEvents(limit = 50) {
  return prisma.systemEvent.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    where: { level: { in: ["error", "warn"] } },
  });
}

export async function getAdminSupportTickets(limit = 50) {
  return prisma.supportTicket.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true, name: true } } },
  });
}
