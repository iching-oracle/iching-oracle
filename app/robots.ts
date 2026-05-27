import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/hexagrams",
          "/hexagrams/",
          "/guides",
          "/guides/",
          "/learn",
          "/learn/",
          "/reading/hexagram-",
          "/share/",
        ],
        disallow: [
          "/dashboard",
          "/history",
          "/billing",
          "/settings",
          "/oracle",
          "/api/",
          "/payment/",
          "/login",
          "/register",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: base,
  };
}
