import "server-only";

import { prisma } from "@/lib/prisma";

export type UserEmailContext = {
  name: string | null;
  preferredLanguage: string;
  dailyStreak: number;
  topCategory: string | null;
  readingsLast7d: number;
  dominantTheme: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  love: "Love & connection",
  career: "Career & purpose",
  finance: "Finance & resources",
  relationships: "Relationships",
  spirituality: "Spirituality",
  "life-decisions": "Life decisions",
  general: "General guidance",
};

/** Privacy-safe personalization — never includes question text. */
export async function getUserEmailContext(
  userId: string,
): Promise<UserEmailContext | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      preferredLanguage: true,
      dailyStreak: true,
    },
  });
  if (!user) return null;

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 7);

  const readings = await prisma.reading.findMany({
    where: { userId, createdAt: { gte: since } },
    select: { category: true, primaryHexagramName: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const categoryCounts = new Map<string, number>();
  for (const r of readings) {
    const c = r.category || "general";
    categoryCounts.set(c, (categoryCounts.get(c) ?? 0) + 1);
  }

  let topCategory: string | null = null;
  let max = 0;
  for (const [cat, count] of categoryCounts) {
    if (count > max) {
      max = count;
      topCategory = cat;
    }
  }

  const dominantTheme = readings[0]?.primaryHexagramName ?? null;

  return {
    name: user.name,
    preferredLanguage: user.preferredLanguage,
    dailyStreak: user.dailyStreak,
    topCategory,
    readingsLast7d: readings.length,
    dominantTheme,
  };
}

export function greetingName(name: string | null): string {
  const n = name?.trim();
  return n ? n.split(/\s+/)[0]! : "Seeker";
}

export function categoryLabel(category: string | null): string {
  if (!category) return "your inner journey";
  return CATEGORY_LABELS[category] ?? category.replace(/-/g, " ");
}

export function buildWeeklyReflectionText(ctx: UserEmailContext): string {
  if (ctx.readingsLast7d === 0) {
    return "This week has been quiet in the outer world — perhaps a good moment to listen inward. When you are ready, the oracle waits without hurry.";
  }

  const cat = categoryLabel(ctx.topCategory);
  const parts = [
    `Over the past week, you consulted the oracle ${ctx.readingsLast7d} time${ctx.readingsLast7d === 1 ? "" : "s"}.`,
  ];

  if (ctx.topCategory) {
    parts.push(`A recurring theme has been ${cat.toLowerCase()} — as if your attention keeps returning to the same inner doorway.`);
  }

  if (ctx.dominantTheme) {
    parts.push(`Your most recent hexagram, ${ctx.dominantTheme}, may still have more to reveal if you sit with it quietly.`);
  }

  if (ctx.dailyStreak >= 3) {
    parts.push(`You have maintained a ${ctx.dailyStreak}-day reflection rhythm. That consistency itself is a form of wisdom.`);
  }

  return parts.join(" ");
}
