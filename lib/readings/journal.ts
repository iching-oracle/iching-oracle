import "server-only";

import { parseChangingLines } from "@/lib/iching";
import { getHexagram } from "@/lib/hexagrams";
import { isInterpretationMode } from "@/lib/interpretation/modes";
import { detectReadingCategory, isReadingCategory } from "@/lib/readings/category";
import { extractReadingSummary } from "@/lib/readings/summary";
import { prisma } from "@/lib/prisma";
import {
  FREE_HISTORY_MAX_ITEMS,
  isPremiumUser,
} from "@/lib/subscription";
import type {
  JournalReadingItem,
  ReadingCategory,
  ReadingHistoryPeriod,
  ReadingJournalQuery,
  ReadingJournalResult,
} from "@/types/reading-journal";
import { sanitizeReadingNotes } from "@/lib/validations/reading-notes";
import type { Prisma, Reading } from "@prisma/client";

export const JOURNAL_PAGE_SIZE = 12;

function resolvePrimaryName(reading: Reading): string {
  if (reading.primaryHexagramName) return reading.primaryHexagramName;
  return getHexagram(reading.hexagram).title;
}

function resolveFinalName(reading: Reading): string | null {
  if (!reading.transformedHexagram) return null;
  if (reading.finalHexagramName) return reading.finalHexagramName;
  return getHexagram(reading.transformedHexagram).title;
}

export function toJournalReadingItem(reading: Reading): JournalReadingItem {
  const category = isReadingCategory(reading.category)
    ? reading.category
    : "general";
  const mode = isInterpretationMode(reading.interpretationMode)
    ? reading.interpretationMode
    : "traditional";
  const summary =
    reading.summary?.trim() ||
    extractReadingSummary(reading.interpretation);

  return {
    id: reading.id,
    question: reading.question,
    primaryHexagramNumber: reading.hexagram,
    primaryHexagramName: resolvePrimaryName(reading),
    resultingHexagramNumber: reading.transformedHexagram,
    resultingHexagramName: resolveFinalName(reading),
    changingLines: parseChangingLines(reading.changingLines),
    interpretationSummary: summary,
    summary,
    category,
    interpretationMode: mode,
    isFavorite: reading.isFavorite,
    notes: reading.notes,
    createdAt: reading.createdAt,
  };
}

function startOfPeriod(period: "week" | "month"): Date {
  const now = new Date();
  if (period === "week") {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  const start = new Date(now);
  start.setMonth(start.getMonth() - 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function buildSearchOr(queryText: string): Prisma.ReadingWhereInput[] {
  const q = queryText.trim();
  const conditions: Prisma.ReadingWhereInput[] = [
    { question: { contains: q, mode: "insensitive" } },
    { interpretation: { contains: q, mode: "insensitive" } },
    { summary: { contains: q, mode: "insensitive" } },
    { primaryHexagramName: { contains: q, mode: "insensitive" } },
    { finalHexagramName: { contains: q, mode: "insensitive" } },
  ];

  const numMatch = q.replace(/^#/, "").match(/^\d{1,2}$/);
  if (numMatch) {
    const num = parseInt(numMatch[0], 10);
    if (num >= 1 && num <= 64) {
      conditions.push({ hexagram: num });
      conditions.push({ transformedHexagram: num });
    }
  }

  return conditions;
}

function isHistoryPeriod(value: string): value is ReadingHistoryPeriod {
  return (
    value === "all" ||
    value === "favorites" ||
    value === "week" ||
    value === "month"
  );
}

function buildWhere(
  userId: string,
  query: ReadingJournalQuery,
): Prisma.ReadingWhereInput {
  const where: Prisma.ReadingWhereInput = { userId };

  if (query.q?.trim()) {
    where.OR = buildSearchOr(query.q);
  }

  const period =
    query.period && isHistoryPeriod(query.period) ? query.period : "all";

  if (period === "favorites") {
    where.isFavorite = true;
  } else if (period === "week") {
    where.createdAt = { gte: startOfPeriod("week") };
  } else if (period === "month") {
    where.createdAt = { gte: startOfPeriod("month") };
  }

  if (query.category && query.category !== "all" && isReadingCategory(query.category)) {
    where.category = query.category;
  }

  if (query.mode && query.mode !== "all" && isInterpretationMode(query.mode)) {
    where.interpretationMode = query.mode;
  }

  if (query.favorite) {
    where.isFavorite = true;
  }

  return where;
}

export async function queryReadingsForUser(
  userId: string,
  query: ReadingJournalQuery = {},
): Promise<ReadingJournalResult> {
  const pageSize = query.pageSize ?? JOURNAL_PAGE_SIZE;
  let page = Math.max(1, query.page ?? 1);
  const sort = query.sort === "asc" ? "asc" : "desc";
  const where = buildWhere(userId, query);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      premiumUntil: true,
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
    },
  });

  const premium = user ? isPremiumUser(user) : false;
  const historyLimited = !premium;

  if (historyLimited) {
    const maxPage = Math.max(1, Math.ceil(FREE_HISTORY_MAX_ITEMS / pageSize));
    page = Math.min(page, maxPage);
  }

  const [total, readings] = await Promise.all([
    prisma.reading.count({ where }),
    prisma.reading.findMany({
      where,
      orderBy: { createdAt: sort },
      skip: (page - 1) * pageSize,
      take: historyLimited
        ? Math.min(pageSize, FREE_HISTORY_MAX_ITEMS)
        : pageSize,
    }),
  ]);

  const cappedTotal = historyLimited
    ? Math.min(total, FREE_HISTORY_MAX_ITEMS)
    : total;

  return {
    items: readings.map(toJournalReadingItem),
    total: cappedTotal,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(cappedTotal / pageSize)),
    historyLimited,
  };
}

export async function getJournalReadingById(
  userId: string,
  readingId: string,
) {
  const reading = await prisma.reading.findFirst({
    where: { id: readingId, userId },
  });

  if (!reading) return null;

  return {
    ...reading,
    journal: toJournalReadingItem(reading),
  };
}

export async function toggleReadingFavorite(
  userId: string,
  readingId: string,
): Promise<{ isFavorite: boolean } | null> {
  const reading = await prisma.reading.findFirst({
    where: { id: readingId, userId },
    select: { id: true, isFavorite: true },
  });

  if (!reading) return null;

  const updated = await prisma.reading.update({
    where: { id: readingId },
    data: { isFavorite: !reading.isFavorite },
    select: { isFavorite: true },
  });

  return { isFavorite: updated.isFavorite };
}

export async function updateReadingNotes(
  userId: string,
  readingId: string,
  notes: string,
): Promise<{ notes: string | null } | null> {
  const reading = await prisma.reading.findFirst({
    where: { id: readingId, userId },
    select: { id: true },
  });

  if (!reading) return null;

  const sanitized = sanitizeReadingNotes(notes);
  const value = sanitized.length > 0 ? sanitized : null;

  const updated = await prisma.reading.update({
    where: { id: readingId },
    data: { notes: value },
    select: { notes: true },
  });

  return { notes: updated.notes };
}

export { detectReadingCategory };
