"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAnalytics } from "@/hooks/use-analytics";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

/** Track page views on route change (consent-gated). */
export function usePageView(pageTitle?: string) {
  const pathname = usePathname();
  const { track, canTrack } = useAnalytics();

  useEffect(() => {
    if (!canTrack || !pathname) return;

    track(ANALYTICS_EVENTS.PAGE_VIEWED, {
      properties: {
        page_path: pathname,
        page_title: pageTitle ?? document.title,
      },
    });
  }, [pathname, pageTitle, track, canTrack]);
}
