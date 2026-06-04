import "server-only";

import { prisma } from "@/lib/prisma";

export type RecentSignupRow = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  isPremium: boolean;
};

export async function getRecentSignups(limit = 8): Promise<RecentSignupRow[]> {
  const now = new Date();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      subscriptionStatus: true,
      premiumUntil: true,
    },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    createdAt: u.createdAt,
    isPremium:
      u.subscriptionStatus === "active" ||
      (u.premiumUntil != null && u.premiumUntil > now),
  }));
}
