import type { MetadataRoute } from "next";
import { listLearnPaths } from "@/lib/content/articles";
import { SITEMAP_STATIC_PATHS } from "@/lib/seo/config";
import { listAllHexagramPaths } from "@/lib/seo/hexagram-content";
import { listProgrammaticPaths } from "@/lib/seo/programmatic-registry";
import { listIndexableReadingSlugs } from "@/lib/seo/public-reading";
import { absoluteUrl } from "@/lib/seo/site";

export const revalidate = 3600;

function priorityForPath(path: string): number {
  if (path === "/") return 1;
  if (path === "/pricing" || path === "/hexagrams") return 0.9;
  if (path.startsWith("/hexagrams/")) return 0.8;
  if (path.startsWith("/guides/") || path.startsWith("/learn/")) return 0.7;
  return 0.6;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPaths = [
    ...SITEMAP_STATIC_PATHS,
    ...listAllHexagramPaths(),
    ...listProgrammaticPaths(),
    ...listLearnPaths(),
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: priorityForPath(path),
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
