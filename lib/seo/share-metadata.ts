import "server-only";

import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import { prisma } from "@/lib/prisma";

/**
 * Share URLs are for social previews only.
 * Canonical points to the indexable /reading/{slug} page when available.
 */
export async function buildSharePageMetadata(
  shareId: string,
): Promise<Metadata> {
  const reading = await prisma.reading.findFirst({
    where: { shareId, isPublic: true },
    select: {
      question: true,
      summary: true,
      primaryHexagramName: true,
      publicSlug: true,
      seoIndexable: true,
    },
  });

  if (!reading) {
    return buildPageMetadata({
      title: "Reading not found",
      description: "This shared reading is no longer available.",
      path: `/share/${shareId}`,
      noindex: true,
    });
  }

  const description = (
    reading.summary?.trim() ||
    reading.question
  ).slice(0, 160);

  const base = buildPageMetadata({
    title: `${reading.primaryHexagramName ?? "I Ching"} — Shared Reading`,
    description,
    path: `/share/${shareId}`,
    noindex: true,
    ogImagePath: reading.publicSlug
      ? `/api/og?path=${encodeURIComponent(`/reading/${reading.publicSlug}`)}`
      : undefined,
  });

  if (reading.publicSlug && reading.seoIndexable) {
    return {
      ...base,
      alternates: {
        canonical: absoluteUrl(`/reading/${reading.publicSlug}`),
      },
    };
  }

  return base;
}
