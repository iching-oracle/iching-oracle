import "server-only";

import {
  JOURNAL_PAGE_SIZE,
  queryReadingsForUser,
  toJournalReadingItem,
  getJournalReadingById,
} from "@/lib/readings/journal";
import { formatChangingLinesList } from "@/lib/readings/format";
import { prisma } from "@/lib/prisma";
import type { JournalReadingItem } from "@/types/reading-journal";

export type { JournalReadingItem as ReadingHistoryItem };
export { toJournalReadingItem, formatChangingLinesList };

export const HISTORY_PAGE_SIZE = JOURNAL_PAGE_SIZE;
export const DASHBOARD_RECENT_LIMIT = 3;

export async function getReadingHistoryForUser(
  userId: string,
  limit = HISTORY_PAGE_SIZE,
): Promise<JournalReadingItem[]> {
  const result = await queryReadingsForUser(userId, {
    page: 1,
    pageSize: limit,
  });
  return result.items;
}

export async function getRecentReadingHistory(
  userId: string,
  limit = DASHBOARD_RECENT_LIMIT,
): Promise<JournalReadingItem[]> {
  return getReadingHistoryForUser(userId, limit);
}

export async function getReadingForHistoryDetail(
  userId: string,
  readingId: string,
) {
  const record = await getJournalReadingById(userId, readingId);
  if (!record) return null;

  return {
    ...record,
    history: record.journal,
    interpretation: record.interpretation,
    question: record.question,
    hexagram: record.hexagram,
    transformedHexagram: record.transformedHexagram,
    changingLines: record.changingLines,
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
