import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

/** Metadata for authenticated, transactional, or utility pages. */
export function buildNoIndexMetadata(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return buildPageMetadata({
    ...input,
    noindex: true,
  });
}
