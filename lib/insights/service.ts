import "server-only";

import {
  buildStatTeaser,
  computeReadingAnalytics,
  type ReadingInsightRow,
} from "@/lib/insights/analytics";
import { generatePatternInsight } from "@/lib/insights/generate";
import { listOracleMilestones } from "@/lib/insights/milestones";
import { getOrCreatePeriodReport } from "@/lib/insights/reports";
import { buildInsightTimeline } from "@/lib/insights/timeline";
import { chargeCreditsForFeature } from "@/lib/credits/assert";
import { isPremiumUser } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import { normalizeLanguageCode } from "@/lib/i18n/languages";
import type { Prisma } from "@prisma/client";
import type {
  InsightsPagePayload,
  PatternInsightAI,
  ResonanceSnapshot,
} from "@/types/insights";

function parseCachedPayload(raw: Prisma.JsonValue): PatternInsightAI | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.summary !== "string") return null;
  return {
    summary: o.summary,
    themes: Array.isArray(o.themes) ? o.themes.map(String) : [],
    patterns: Array.isArray(o.patterns) ? o.patterns.map(String) : [],
    reflections: Array.isArray(o.reflections)
      ? o.reflections.map(String)
      : [],
    emotionalGuidance: Array.isArray(o.emotionalGuidance)
      ? o.emotionalGuidance.map(String)
      : undefined,
    growthSummary:
      typeof o.growthSummary === "string" ? o.growthSummary : undefined,
    oracleTrendAnalysis:
      typeof o.oracleTrendAnalysis === "string"
        ? o.oracleTrendAnalysis
        : undefined,
  };
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_READINGS = 200;

function isCacheFresh(generatedAt: Date): boolean {
  return Date.now() - generatedAt.getTime() < CACHE_TTL_MS;
}

async function loadResonanceSnapshot(
  userId: string,
): Promise<ResonanceSnapshot | null> {
  const groups = await prisma.readingFeedback.groupBy({
    by: ["resonance"],
    where: { userId },
    _count: { resonance: true },
  });
  if (groups.length === 0) return null;

  const snap: ResonanceSnapshot = { deeply: 0, somewhat: 0, notReally: 0 };
  for (const g of groups) {
    const n = g._count.resonance;
    if (g.resonance === "deeply") snap.deeply = n;
    else if (g.resonance === "somewhat") snap.somewhat = n;
    else if (g.resonance === "not_really") snap.notReally = n;
  }
  return snap;
}

export async function getInsightsPagePayload(
  userId: string,
  locale = "en-US",
  options?: { forceRefresh?: boolean },
): Promise<InsightsPagePayload | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      preferredLanguage: true,
      premiumUntil: true,
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
      memoryEnabled: true,
      _count: { select: { memories: true } },
    },
  });

  if (!user) {
    return null;
  }

  const premium = isPremiumUser(user);
  const language = normalizeLanguageCode(user.preferredLanguage);

  const [readings, resonance, milestones] = await Promise.all([
    prisma.reading.findMany({
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
    }),
    loadResonanceSnapshot(userId),
    listOracleMilestones(userId, 20),
  ]);

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

  const analytics = computeReadingAnalytics(rows, locale, resonance);
  const statTeaser = buildStatTeaser(analytics);

  const timeline = await buildInsightTimeline(
    userId,
    readings,
    milestones,
    user.memoryEnabled,
  );

  const base: InsightsPagePayload = {
    isPremium: premium,
    analytics,
    ai: null,
    weeklyReport: null,
    monthlyReport: null,
    timeline,
    milestones,
    memoryEnabled: user.memoryEnabled,
    memoryCount: user._count.memories,
    generatedAt: null,
    cacheHit: false,
    statTeaser,
  };

  if (rows.length === 0) {
    return base;
  }

  if (!premium) {
    return base;
  }

  let ai: PatternInsightAI | null = null;
  let generatedAt: string | null = null;
  let cacheHit = false;

  const cached = options?.forceRefresh
    ? null
    : await prisma.patternInsightCache.findUnique({
        where: { userId },
      });

  if (
    cached &&
    cached.revision === analytics.revision &&
    isCacheFresh(cached.generatedAt)
  ) {
    ai = parseCachedPayload(cached.payload);
    if (ai) {
      generatedAt = cached.generatedAt.toISOString();
      cacheHit = true;
    }
  }

  if (!ai) {
    const creditCharge = await chargeCreditsForFeature(
      userId,
      "pattern_insight",
    );
    if (!creditCharge.ok) {
      throw new Error(creditCharge.message);
    }

    ai = await generatePatternInsight(analytics, readings, language, true);

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

    generatedAt = new Date().toISOString();
  }

  const [weeklyReport, monthlyReport] = await Promise.all([
    getOrCreatePeriodReport(
      userId,
      "weekly",
      analytics,
      readings,
      language,
      options,
    ),
    getOrCreatePeriodReport(
      userId,
      "monthly",
      analytics,
      readings,
      language,
      options,
    ),
  ]);

  return {
    ...base,
    ai,
    weeklyReport,
    monthlyReport,
    generatedAt,
    cacheHit,
  };
}
