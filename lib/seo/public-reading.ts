import "server-only";

import { extractReadingSummary } from "@/lib/readings/summary";
import { isPremiumInterpretationPreview } from "@/lib/premium-preview";
import { readingPublicSlug } from "@/lib/seo/slugs";
import { getHexagram } from "@/lib/hexagrams";
import { prisma } from "@/lib/prisma";
import type { PublicReadingSeoPayload } from "@/types/seo";

const MIN_INDEXABLE_WORDS = 80;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function isReadingIndexable(interpretation: string, summary?: string | null): boolean {
  if (isPremiumInterpretationPreview(interpretation)) return false;
  const text = `${summary ?? ""} ${interpretation}`.trim();
  return countWords(text) >= MIN_INDEXABLE_WORDS;
}

export function buildReadingSeoFields(reading: {
  hexagram: number;
  question: string;
  category: string;
  interpretation: string;
  summary?: string | null;
  primaryHexagramName?: string | null;
}) {
  const hex = getHexagram(reading.hexagram);
  const title = reading.primaryHexagramName ?? hex.title;
  const summary =
    reading.summary?.trim() ||
    extractReadingSummary(reading.interpretation) ||
    hex.judgment;
  const slug = readingPublicSlug({
    hexagram: reading.hexagram,
    question: reading.question,
    category: reading.category,
  });
  const indexable = isReadingIndexable(reading.interpretation, summary);

  return {
    publicSlug: slug,
    seoTitle: `${title} — Oracle Reading`,
    seoDescription: summary.slice(0, 160),
    seoIndexable: indexable,
    publishedAt: indexable ? new Date() : null,
  };
}

export async function getPublicReadingBySlug(
  slug: string,
): Promise<PublicReadingSeoPayload | null> {
  const reading = await prisma.reading.findFirst({
    where: {
      OR: [{ publicSlug: slug }, { shareId: slug }],
      isPublic: true,
      seoIndexable: true,
    },
    select: {
      id: true,
      publicSlug: true,
      question: true,
      hexagram: true,
      primaryHexagramName: true,
      transformedHexagram: true,
      finalHexagramName: true,
      interpretation: true,
      summary: true,
      category: true,
      viewCount: true,
      shareCount: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  if (!reading?.publicSlug) return null;

  const hex = getHexagram(reading.hexagram);
  const summary =
    reading.summary?.trim() ||
    extractReadingSummary(reading.interpretation) ||
    hex.judgment;

  return {
    id: reading.id,
    publicSlug: reading.publicSlug,
    question: reading.question,
    hexagram: reading.hexagram,
    primaryTitle: reading.primaryHexagramName ?? hex.title,
    chineseName: hex.chineseName,
    judgment: hex.judgment,
    interpretation: reading.interpretation,
    summary,
    category: reading.category,
    transformedHexagram: reading.transformedHexagram,
    finalTitle: reading.finalHexagramName,
    viewCount: reading.viewCount,
    shareCount: reading.shareCount,
    publishedAt: reading.publishedAt ?? reading.createdAt,
    createdAt: reading.createdAt,
  };
}

export async function incrementReadingView(slug: string): Promise<void> {
  await prisma.reading.updateMany({
    where: { publicSlug: slug, isPublic: true },
    data: { viewCount: { increment: 1 } },
  });
}

export async function listIndexableReadingSlugs(limit = 5000): Promise<string[]> {
  const rows = await prisma.reading.findMany({
    where: { isPublic: true, seoIndexable: true, publicSlug: { not: null } },
    select: { publicSlug: true },
    take: limit,
    orderBy: { publishedAt: "desc" },
  });
  return rows
    .map((r) => r.publicSlug)
    .filter((s): s is string => Boolean(s));
}
