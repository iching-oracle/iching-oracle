import type { MetadataRoute } from "next";
import { listLearnPaths } from "@/lib/content/articles";
import { listAllHexagramPaths } from "@/lib/seo/hexagram-content";
import { listProgrammaticPaths } from "@/lib/seo/programmatic-registry";
import { listIndexableReadingSlugs } from "@/lib/seo/public-reading";
import { absoluteUrl } from "@/lib/seo/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPaths = [
    "/",
    "/pricing",
    "/guides",
    "/reading/guided",
    "/reading/new",
    ...listAllHexagramPaths(),
    ...listProgrammaticPaths(),
    ...listLearnPaths(),
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/hexagrams/") ? 0.8 : 0.6,
  }));

  let readingEntries: MetadataRoute.Sitemap = [];
  try {
    const slugs = await listIndexableReadingSlugs(5000);
    readingEntries = slugs.map((slug) => ({
      url: absoluteUrl(`/reading/${slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
  } catch {
    /* DB unavailable during build */
  }

  return [...staticEntries, ...readingEntries];
}
