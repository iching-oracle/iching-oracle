import "server-only";

import { buildShareCardData } from "@/lib/share/data";
import { getHexagram } from "@/lib/hexagrams";
import { prisma } from "@/lib/prisma";
import type { PublicSharedReadingPayload } from "@/types/share";

const publicReadingSelect = {
  shareId: true,
  question: true,
  hexagram: true,
  primaryHexagramName: true,
  transformedHexagram: true,
  finalHexagramName: true,
  changingLines: true,
  interpretation: true,
  summary: true,
  category: true,
  createdAt: true,
  language: true,
} as const;

function toPayload(
  reading: {
    shareId: string;
    question: string;
    hexagram: number;
    primaryHexagramName: string | null;
    interpretation: string;
    createdAt: Date;
    language: string;
  } & Parameters<typeof buildShareCardData>[0],
): PublicSharedReadingPayload {
  const hex = getHexagram(reading.hexagram);
  const locale = reading.language === "de" ? "de-DE" : "en-US";
  const card = buildShareCardData(reading, locale);

  return {
    shareId: reading.shareId,
    question: reading.question.trim(),
    interpretation: reading.interpretation.trim(),
    hexagramNumber: hex.number,
    hexagramName: reading.primaryHexagramName ?? hex.englishName,
    hexagramChineseName: hex.chineseName,
    dateLabel: card.dateLabel,
    card,
  };
}

export async function getPublicSharePayload(
  shareId: string,
  options?: { trackView?: boolean },
): Promise<PublicSharedReadingPayload | null> {
  const reading = await prisma.reading.findFirst({
    where: { shareId, isPublic: true },
    select: publicReadingSelect,
  });

  if (!reading?.shareId) return null;

  if (options?.trackView) {
    void prisma.reading
      .update({
        where: { shareId: reading.shareId },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {
        /* non-blocking */
      });
  }

  return toPayload(reading);
}
