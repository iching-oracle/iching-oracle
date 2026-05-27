import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SeoTrackEvent =
  | "page_view"
  | "share"
  | "cta_click"
  | "reading_start";

export async function trackSeoEvent(input: {
  path: string;
  event: SeoTrackEvent;
  source?: string;
  keyword?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.seoAnalyticsEvent.create({
      data: {
        path: input.path.slice(0, 500),
        event: input.event,
        source: input.source?.slice(0, 120),
        keyword: input.keyword?.slice(0, 120),
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (error) {
    console.error("[seo/analytics]", error);
  }
}
