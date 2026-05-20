import "server-only";

import { parseChangingLines } from "@/lib/iching";
import { getHexagram } from "@/lib/hexagrams";
import { truncate } from "@/lib/truncate";
import type { ReadingHistoryItem } from "@/types/reading-history";
import { prisma } from "@/lib/prisma";
import type { Reading } from "@prisma/client";

export const HISTORY_PAGE_SIZE = 50;
export const DASHBOARD_RECENT_LIMIT = 3;

function resolvePrimaryName(reading: Reading): string {
  if (reading.primaryHexagramName) return reading.primaryHexagramName;
  return getHexagram(reading.hexagram).title;
}

function resolveFinalName(reading: Reading): string | null {
  if (!reading.transformedHexagram) return null;
  if (reading.finalHexagramName) return reading.finalHexagramName;
  return getHexagram(reading.transformedHexagram).title;
}

export function toReadingHistoryItem(reading: Reading): ReadingHistoryItem {
  return {
    id: reading.id,
    question: reading.question,
    primaryHexagramNumber: reading.hexagram,
    primaryHexagramName: resolvePrimaryName(reading),
    changingLines: parseChangingLines(reading.changingLines),
    finalHexagramNumber: reading.transformedHexagram,
    finalHexagramName: resolveFinalName(reading),
    interpretationSummary: truncate(reading.interpretation, 160),
    createdAt: reading.createdAt,
  };
}

export async function getReadingHistoryForUser(
  userId: string,
  limit = HISTORY_PAGE_SIZE,
): Promise<ReadingHistoryItem[]> {
  const readings = await prisma.reading.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return readings.map(toReadingHistoryItem);
}

export async function getRecentReadingHistory(
  userId: string,
  limit = DASHBOARD_RECENT_LIMIT,
): Promise<ReadingHistoryItem[]> {
  return getReadingHistoryForUser(userId, limit);
}

export async function getReadingForHistoryDetail(
  userId: string,
  readingId: string,
) {
  const reading = await prisma.reading.findFirst({
    where: { id: readingId, userId },
  });

  if (!reading) return null;

  return {
    ...reading,
    history: toReadingHistoryItem(reading),
  };
}

export async function deleteReadingForUser(
  userId: string,
  readingId: string,
): Promise<boolean> {
  const result = await prisma.reading.deleteMany({
    where: { id: readingId, userId },
  });
  return result.count > 0;
}

export function formatChangingLinesList(lines: number[]): string {
  if (lines.length === 0) return "—";
  return lines.join(", ");
}
