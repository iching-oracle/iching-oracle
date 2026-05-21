import "server-only";

import { parseChangingLines } from "@/lib/iching";
import { getHexagram } from "@/lib/hexagrams";
import { isInterpretationMode } from "@/lib/interpretation/modes";
import { detectReadingCategory, isReadingCategory } from "@/lib/readings/category";
import { extractReadingSummary } from "@/lib/readings/summary";
import { prisma } from "@/lib/prisma";
import type {
  JournalReadingItem,
  ReadingCategory,
  ReadingJournalQuery,
  ReadingJournalResult,
} from "@/types/reading-journal";
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
    createdAt: reading.createdAt,
  };
}

function buildWhere(
  userId: string,
  query: ReadingJournalQuery,
): Prisma.ReadingWhereInput {
  const where: Prisma.ReadingWhereInput = { userId };

  if (query.q?.trim()) {
    where.question = { contains: query.q.trim(), mode: "insensitive" };
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
  const page = Math.max(1, query.page ?? 1);
  const sort = query.sort === "asc" ? "asc" : "desc";
  const where = buildWhere(userId, query);

  const [total, readings] = await Promise.all([
    prisma.reading.count({ where }),
    prisma.reading.findMany({
      where,
      orderBy: { createdAt: sort },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: readings.map(toJournalReadingItem),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
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

export { detectReadingCategory };
