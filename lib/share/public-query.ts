import "server-only";

import { buildShareCardData } from "@/lib/share/data";
import { prisma } from "@/lib/prisma";
import type { ShareCardReadingData } from "@/types/share";

export async function getPublicSharePayload(
  shareId: string,
): Promise<{ data: ShareCardReadingData; shareId: string } | null> {
  const reading = await prisma.reading.findFirst({
    where: { shareId, isPublic: true },
    select: {
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
    },
  });

  if (!reading?.shareId) return null;

  return {
    shareId: reading.shareId,
    data: buildShareCardData(reading),
  };
}
