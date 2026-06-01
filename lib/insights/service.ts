import "server-only";

import {
  buildStatTeaser,
  computeReadingAnalytics,
  type ReadingInsightRow,
} from "@/lib/insights/analytics";
import { generatePatternInsight } from "@/lib/insights/generate";
import { chargeCreditsForFeature } from "@/lib/credits/assert";
import { isPremiumUser } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import { normalizeLanguageCode } from "@/lib/i18n/languages";
import type { Prisma } from "@prisma/client";
import type { InsightsPagePayload, PatternInsightAI } from "@/types/insights";

function parseCachedPayload(raw: Prisma.JsonValue): PatternInsightAI | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.summary !== "string") return null;
  return {
    summary: o.summary,
    themes: Array.isArray(o.themes) ? o.themes.map(String) : [],
    patterns: Array.isArray(o.patterns) ? o.patterns.map(String) : [],
    reflections: Array.isArray(o.reflections) ? o.reflections.map(String) : [],
  };
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_READINGS = 200;

function isCacheFresh(generatedAt: Date): boolean {
  return Date.now() - generatedAt.getTime() < CACHE_TTL_MS;
}

export async function getInsightsPagePayload(
  userId: string,
  locale = "en-US",
): Promise<InsightsPagePayload | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      preferredLanguage: true,
      premiumUntil: true,
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
    },
  });

  if (!user) {
    return null;
  }

  const premium = isPremiumUser(user);
  const language = normalizeLanguageCode(user.preferredLanguage);

  const readings = await prisma.reading.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: MAX_READINGS,
    select: {
      id: true,
      question: true,
      category: true,
      hexagram: true,
      transformedHexagram: true,
      createdAt: true,
      isFavorite: true,
      summary: true,
    },
  });

  const rows: ReadingInsightRow[] = readings.map((r) => ({
    id: r.id,
    question: r.question,
    category: r.category,
    hexagram: r.hexagram,
    transformedHexagram: r.transformedHexagram,
    createdAt: r.createdAt,
    isFavorite: r.isFavorite,
    summary: r.summary,
  }));

  const analytics = computeReadingAnalytics(rows, locale);
  const statTeaser = buildStatTeaser(analytics);

  if (rows.length === 0) {
    return {
      isPremium: premium,
      analytics,
      ai: null,
      generatedAt: null,
      cacheHit: false,
      statTeaser,
    };
  }

  if (!premium) {
    return {
      isPremium: false,
      analytics,
      ai: null,
      generatedAt: null,
      cacheHit: false,
      statTeaser,
    };
  }

  const cached = await prisma.patternInsightCache.findUnique({
    where: { userId },
  });

  if (
    cached &&
    cached.revision === analytics.revision &&
    isCacheFresh(cached.generatedAt)
  ) {
    const ai = parseCachedPayload(cached.payload);
    if (!ai) {
      /* fall through to regenerate */
    } else {
      return {
        isPremium: true,
        analytics,
        ai,
        generatedAt: cached.generatedAt.toISOString(),
        cacheHit: true,
        statTeaser,
      };
    }
  }

  const creditCharge = await chargeCreditsForFeature(
    userId,
    "pattern_insight",
  );
  if (!creditCharge.ok) {
    throw new Error(creditCharge.message);
  }

  const ai = await generatePatternInsight(analytics, readings, language);

  await prisma.patternInsightCache.upsert({
    where: { userId },
    create: {
      userId,
      revision: analytics.revision,
      payload: ai as Prisma.InputJsonValue,
    },
    update: {
      revision: analytics.revision,
      payload: ai as Prisma.InputJsonValue,
      generatedAt: new Date(),
    },
  });

  return {
    isPremium: true,
    analytics,
    ai,
    generatedAt: new Date().toISOString(),
    cacheHit: false,
    statTeaser,
  };
}
