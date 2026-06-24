"use client";

import { useEffect } from "react";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { useAnalytics } from "@/hooks/use-analytics";

type SharePageTrackerProps = {
  shareId: string;
  hexagramNumber: number;
};

export function SharePageTracker({
  shareId,
  hexagramNumber,
}: SharePageTrackerProps) {
  const { track, canTrack } = useAnalytics();

  useEffect(() => {
    if (!canTrack) return;
    track(ANALYTICS_EVENTS.SHARED_READING_VIEWED, {
      properties: {
        share_id: shareId,
        hexagram_number: hexagramNumber,
      },
    });
  }, [canTrack, hexagramNumber, shareId, track]);

  return null;
}
