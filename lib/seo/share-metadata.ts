import "server-only";

import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import { prisma } from "@/lib/prisma";

export async function buildSharePageMetadata(
  shareId: string,
): Promise<Metadata> {
  const reading = await prisma.reading.findFirst({
    where: { shareId, isPublic: true },
    select: {
      question: true,
      primaryHexagramName: true,
      hexagram: true,
      createdAt: true,
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

  const hexagramName = reading.primaryHexagramName ?? `Hexagram ${reading.hexagram}`;
  const title = `I Ching Reading: ${hexagramName}`;
  const description = `Question asked: ${reading.question}`.slice(0, 160);
  const path = `/share/${shareId}`;

  return buildPageMetadata({
    title,
    description,
    path,
    noindex: false,
    ogType: "article",
    publishedTime: reading.createdAt.toISOString(),
    ogImagePath: `/share/${shareId}/opengraph-image`,
  });
}

export function getShareCanonicalUrl(shareId: string): string {
  return absoluteUrl(`/share/${shareId}`);
}
