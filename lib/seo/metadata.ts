import type { Metadata } from "next";
import { getMetadataBase } from "@/lib/seo/config";
import { absoluteUrl, DEFAULT_OG_LOCALE, SITE_NAME } from "@/lib/seo/site";

export type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noindex?: boolean;
  ogImagePath?: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(input.path);
  const ogImage = absoluteUrl(
    input.ogImagePath ?? `/api/og?path=${encodeURIComponent(input.path)}`,
  );

  const fullTitle = input.title.includes(SITE_NAME)
    ? input.title
    : `${input.title} | ${SITE_NAME}`;

  const gsc = process.env.NEXT_PUBLIC_GSC_VERIFICATION?.trim();

  return {
    metadataBase: getMetadataBase(),
    title: fullTitle,
    description: input.description.slice(0, 160),
    keywords: input.keywords,
    ...(gsc ? { verification: { google: gsc } } : {}),
    alternates: { canonical },
    openGraph: {
      title: fullTitle,
      description: input.description.slice(0, 200),
      url: canonical,
      siteName: SITE_NAME,
      locale: DEFAULT_OG_LOCALE,
      type: input.ogType ?? "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: input.title }],
      ...(input.publishedTime
        ? { publishedTime: input.publishedTime }
        : undefined),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : undefined),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: input.description.slice(0, 200),
      images: [ogImage],
    },
    robots: input.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
