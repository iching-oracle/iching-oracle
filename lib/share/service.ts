import "server-only";

import { buildReadingSeoFields } from "@/lib/seo/public-reading";
import { generateShareId } from "@/lib/share/id";
import { getAppUrl } from "@/lib/stripe";
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
    select: {
      id: true,
      shareId: true,
      publicSlug: true,
      hexagram: true,
      question: true,
      category: true,
      interpretation: true,
      summary: true,
      primaryHexagramName: true,
    },
  });

  if (!reading) return null;

  if (!enable) {
    await prisma.reading.update({
      where: { id: readingId },
      data: { isPublic: false, seoIndexable: false },
    });
    return { shareId: reading.shareId, isPublic: false };
  }

  const shareId = reading.shareId ?? generateShareId();
  const seo = buildReadingSeoFields(reading);

  let publicSlug = reading.publicSlug ?? seo.publicSlug;
  const collision = await prisma.reading.findFirst({
    where: { publicSlug, id: { not: readingId } },
    select: { id: true },
  });
  if (collision) {
    publicSlug = `${seo.publicSlug}-${shareId.slice(0, 6)}`;
  }

  await prisma.reading.update({
    where: { id: readingId },
    data: {
      isPublic: true,
      shareId,
      publicSlug,
      seoTitle: seo.seoTitle,
      seoDescription: seo.seoDescription,
      seoIndexable: seo.seoIndexable,
      publishedAt: seo.publishedAt,
    },
  });

  return { shareId, isPublic: true };
}

/** Enable sharing and return the public URL (creates shareId when missing). */
export async function enableReadingShare(
  userId: string,
  readingId: string,
): Promise<{ url: string; shareId: string } | null> {
  const result = await setReadingShareEnabled(userId, readingId, true);
  if (!result?.shareId) return null;

  return {
    shareId: result.shareId,
    url: `${getAppUrl()}/share/${result.shareId}`,
  };
}
