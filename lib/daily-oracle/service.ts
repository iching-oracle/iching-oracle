import "server-only";

import { generateDailyOracleContent } from "@/lib/daily-oracle/generate";
import {
  castDeterministicLines,
  getTodayDateString,
  parseDateOnly,
  parseLineValues,
  serializeLineValues,
} from "@/lib/daily-oracle/seed";
import { updateDailyStreakForUser, getDailyStreakForUser } from "@/lib/daily-oracle/streak";
import { normalizeLanguageCode } from "@/lib/i18n/languages";
import {
  findHexagramNumber,
  lineValuesToBooleans,
} from "@/lib/hexagram-lines";
import { getHexagram } from "@/lib/hexagrams";
import { prisma } from "@/lib/prisma";
import type { DailyOraclePayload, DailyOracleHistoryItem } from "@/types/daily-oracle";
import type { DailyOracle } from "@prisma/client";

function toPayload(
  record: DailyOracle,
  options: { streak: number; isAuthenticated: boolean },
): DailyOraclePayload {
  return {
    id: record.id,
    date: record.date.toISOString().slice(0, 10),
    hexagramNumber: record.hexagramNumber,
    lineValues: parseLineValues(record.lineValues),
    oracleMessage: record.oracleMessage,
    emotionalInsight: record.emotionalInsight,
    recommendedAction: record.recommendedAction,
    caution: record.caution,
    reflectionQuote: record.reflectionQuote,
    luckyFocus: record.luckyFocus,
    energyLevel: record.energyLevel,
    energyTheme: record.energyTheme,
    isFavorite: record.isFavorite,
    isAuthenticated: options.isAuthenticated,
    streak: options.streak,
  };
}

async function createDailyOracleRecord(params: {
  userId: string | null;
  visitorKey: string | null;
  dateKey: string;
  identityKey: string;
  language: string;
}): Promise<DailyOracle> {
  const lineValues = castDeterministicLines(params.dateKey, params.identityKey);
  const hexNum = findHexagramNumber(lineValuesToBooleans(lineValues));

  const content = await generateDailyOracleContent(
    hexNum,
    params.dateKey,
    params.language,
  );

  const hex = getHexagram(hexNum);
  const interpretation = JSON.stringify({
    ...content,
    hexagram: {
      number: hex.number,
      title: hex.title,
      chineseName: hex.chineseName,
      judgment: hex.judgment,
    },
  });

  return prisma.dailyOracle.create({
    data: {
      userId: params.userId,
      visitorKey: params.visitorKey,
      date: parseDateOnly(params.dateKey),
      hexagramNumber: hexNum,
      lineValues: serializeLineValues(lineValues),
      oracleMessage: content.oracleMessage,
      emotionalInsight: content.emotionalInsight,
      recommendedAction: content.recommendedAction,
      caution: content.caution,
      reflectionQuote: content.reflectionQuote,
      luckyFocus: content.luckyFocus,
      energyLevel: content.energyLevel,
      energyTheme: content.energyTheme,
      interpretation,
    },
  });
}

export async function getOrCreateDailyOracleForUser(
  userId: string,
  dateKey = getTodayDateString(),
  options?: { updateStreak?: boolean },
): Promise<DailyOraclePayload> {
  const updateStreak = options?.updateStreak !== false;

  const existing = await prisma.dailyOracle.findUnique({
    where: {
      userId_date: {
        userId,
        date: parseDateOnly(dateKey),
      },
    },
  });

  if (existing) {
    const streak = updateStreak
      ? await updateDailyStreakForUser(userId, dateKey)
      : await getDailyStreakForUser(userId);
    return toPayload(existing, { streak, isAuthenticated: true });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferredLanguage: true },
  });
  const language = normalizeLanguageCode(user?.preferredLanguage);

  const record = await createDailyOracleRecord({
    userId,
    visitorKey: null,
    dateKey,
    identityKey: userId,
    language,
  });

  const streak = updateStreak
    ? await updateDailyStreakForUser(userId, dateKey)
    : await getDailyStreakForUser(userId);
  return toPayload(record, { streak, isAuthenticated: true });
}

export async function getOrCreateDailyOracleForVisitor(
  visitorKey: string,
  dateKey = getTodayDateString(),
): Promise<DailyOraclePayload> {
  const existing = await prisma.dailyOracle.findUnique({
    where: {
      visitorKey_date: {
        visitorKey,
        date: parseDateOnly(dateKey),
      },
    },
  });

  if (existing) {
    return toPayload(existing, { streak: 0, isAuthenticated: false });
  }

  const record = await createDailyOracleRecord({
    userId: null,
    visitorKey,
    dateKey,
    identityKey: visitorKey,
    language: "en",
  });

  return toPayload(record, { streak: 0, isAuthenticated: false });
}

export async function getDailyOracleHistory(
  userId: string,
  limit = 30,
): Promise<DailyOracleHistoryItem[]> {
  const rows = await prisma.dailyOracle.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: limit,
  });

  return rows.map((r) => ({
    id: r.id,
    date: r.date.toISOString().slice(0, 10),
    hexagramNumber: r.hexagramNumber,
    oracleMessage: r.oracleMessage,
    reflectionQuote: r.reflectionQuote,
    energyLevel: r.energyLevel,
    isFavorite: r.isFavorite,
  }));
}

export async function toggleDailyOracleFavorite(
  userId: string,
  oracleId: string,
): Promise<boolean | null> {
  const row = await prisma.dailyOracle.findFirst({
    where: { id: oracleId, userId },
  });
  if (!row) return null;

  const updated = await prisma.dailyOracle.update({
    where: { id: oracleId },
    data: { isFavorite: !row.isFavorite },
  });
  return updated.isFavorite;
}

export async function getTodayOracleTeaser(
  userId?: string | null,
  visitorKey?: string | null,
): Promise<Pick<DailyOraclePayload, "oracleMessage" | "reflectionQuote" | "hexagramNumber" | "date" | "energyLevel">> {
  if (userId) {
    const full = await getOrCreateDailyOracleForUser(userId);
    return {
      date: full.date,
      hexagramNumber: full.hexagramNumber,
      oracleMessage: full.oracleMessage,
      reflectionQuote: full.reflectionQuote,
      energyLevel: full.energyLevel,
    };
  }
  if (visitorKey) {
    const full = await getOrCreateDailyOracleForVisitor(visitorKey);
    return {
      date: full.date,
      hexagramNumber: full.hexagramNumber,
      oracleMessage: full.oracleMessage,
      reflectionQuote: full.reflectionQuote,
      energyLevel: full.energyLevel,
    };
  }
  const dateKey = getTodayDateString();
  const hex = (await import("@/lib/daily-oracle/seed")).getDeterministicHexagram(
    dateKey,
    "guest",
  );
  return {
    date: dateKey,
    hexagramNumber: hex,
    oracleMessage: "Open today's oracle to receive your daily hexagram.",
    reflectionQuote: "The day awaits your attention.",
    energyLevel: 50,
  };
}
