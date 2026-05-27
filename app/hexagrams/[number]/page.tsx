import { notFound } from "next/navigation";
import { HexagramPageView } from "@/components/seo/hexagram-page-view";
import { buildHexagramSeoContent } from "@/lib/seo/hexagram-content";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { isValidHexagramNumber } from "@/lib/seo/slugs";

export const revalidate = 86400;

type PageProps = { params: Promise<{ number: string }> };

export async function generateStaticParams() {
  return Array.from({ length: 64 }, (_, i) => ({
    number: String(i + 1),
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { number: raw } = await params;
  const number = parseInt(raw, 10);
  if (!isValidHexagramNumber(number)) return {};
  const content = buildHexagramSeoContent(number, "general");
  return buildPageMetadata({
    title: content.metaTitle,
    description: content.metaDescription,
    path: content.canonicalPath,
    keywords: [
      `hexagram ${number}`,
      content.englishName,
      "i ching meaning",
    ],
    ogImagePath: `/hexagrams/${number}/opengraph-image`,
  });
}

export default async function HexagramPage({ params }: PageProps) {
  const { number: raw } = await params;
  const number = parseInt(raw, 10);
  if (!isValidHexagramNumber(number)) notFound();

  const content = buildHexagramSeoContent(number, "general");
  return <HexagramPageView content={content} />;
}
