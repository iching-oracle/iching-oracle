import { notFound } from "next/navigation";
import { HexagramPageView } from "@/components/seo/hexagram-page-view";
import { buildHexagramSeoContent } from "@/lib/seo/hexagram-content";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { isValidHexagramNumber } from "@/lib/seo/slugs";
import type { HexagramTopic } from "@/types/seo";

export const revalidate = 86400;

const TOPICS: HexagramTopic[] = ["love", "career", "spirituality"];

type PageProps = { params: Promise<{ number: string; topic: string }> };

export async function generateStaticParams() {
  const params: Array<{ number: string; topic: string }> = [];
  for (let n = 1; n <= 64; n++) {
    for (const topic of TOPICS) {
      params.push({ number: String(n), topic });
    }
  }
  return params;
}

function parseTopic(raw: string): HexagramTopic | null {
  return TOPICS.includes(raw as HexagramTopic) ? (raw as HexagramTopic) : null;
}

export async function generateMetadata({ params }: PageProps) {
  const { number: rawN, topic: rawT } = await params;
  const number = parseInt(rawN, 10);
  const topic = parseTopic(rawT);
  if (!isValidHexagramNumber(number) || !topic) return {};
  const content = buildHexagramSeoContent(number, topic);
  return buildPageMetadata({
    title: content.metaTitle,
    description: content.metaDescription,
    path: content.canonicalPath,
    ogImagePath: `/hexagrams/${number}/opengraph-image`,
  });
}

export default async function HexagramTopicPage({ params }: PageProps) {
  const { number: rawN, topic: rawT } = await params;
  const number = parseInt(rawN, 10);
  const topic = parseTopic(rawT);
  if (!isValidHexagramNumber(number) || !topic) notFound();

  const content = buildHexagramSeoContent(number, topic);
  return <HexagramPageView content={content} />;
}
