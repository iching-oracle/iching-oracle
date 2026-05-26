import "server-only";

import { generateShareId } from "@/lib/share/id";
import { prisma } from "@/lib/prisma";

export async function getReadingForOwnerShare(
  userId: string,
  readingId: string,
) {
  return prisma.reading.findFirst({
    where: { id: readingId, userId },
    select: {
      id: true,
      shareId: true,
      isPublic: true,
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
}

export async function setReadingShareEnabled(
  userId: string,
  readingId: string,
  enable: boolean,
): Promise<{ shareId: string | null; isPublic: boolean } | null> {
  const reading = await prisma.reading.findFirst({
    where: { id: readingId, userId },
    select: { id: true, shareId: true },
  });

  if (!reading) return null;

  if (!enable) {
    await prisma.reading.update({
      where: { id: readingId },
      data: { isPublic: false },
    });
    return { shareId: reading.shareId, isPublic: false };
  }

  const shareId = reading.shareId ?? generateShareId();
  await prisma.reading.update({
    where: { id: readingId },
    data: { isPublic: true, shareId },
  });

  return { shareId, isPublic: true };
}
