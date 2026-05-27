import { notFound } from "next/navigation";
import { PublicReadingView } from "@/components/seo/public-reading-view";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getPublicReadingBySlug,
  incrementReadingView,
} from "@/lib/seo/public-reading";
import { prisma } from "@/lib/prisma";

type PublicSeoPageProps = { slug: string };

export async function generatePublicReadingMetadata(slug: string) {
  const reading = await getPublicReadingBySlug(slug);
  if (!reading) return null;

  return buildPageMetadata({
    title: `${reading.primaryTitle} — Oracle Reading`,
    description: reading.summary,
    path: `/reading/${reading.publicSlug}`,
    ogImagePath: `/api/og?path=${encodeURIComponent(`/reading/${reading.publicSlug}`)}`,
    ogType: "article",
    publishedTime: reading.publishedAt.toISOString(),
  });
}

export async function PublicSeoReadingPage({ slug }: PublicSeoPageProps) {
  const reading = await getPublicReadingBySlug(slug);
  if (!reading) notFound();

  await incrementReadingView(slug);

  const related = await prisma.reading.findMany({
    where: {
      isPublic: true,
      seoIndexable: true,
      publicSlug: { not: reading.publicSlug },
      hexagram: reading.hexagram,
    },
    select: { publicSlug: true, seoTitle: true, primaryHexagramName: true, question: true },
    take: 4,
    orderBy: { viewCount: "desc" },
  });

  const relatedSlugs = related
    .filter((r) => r.publicSlug)
    .map((r) => ({
      slug: r.publicSlug!,
      title: r.seoTitle ?? r.primaryHexagramName ?? r.question.slice(0, 60),
    }));

  return <PublicReadingView reading={reading} relatedSlugs={relatedSlugs} />;
}
