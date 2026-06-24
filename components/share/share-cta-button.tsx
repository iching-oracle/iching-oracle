"use client";

import Link from "next/link";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { useAnalytics } from "@/hooks/use-analytics";

type ShareCtaButtonProps = {
  shareId: string;
};

export function ShareCtaButton({ shareId }: ShareCtaButtonProps) {
  const { track, canTrack } = useAnalytics();

  function handleClick() {
    if (canTrack) {
      track(ANALYTICS_EVENTS.SHARED_READING_CTA_CLICKED, {
        properties: { share_id: shareId, cta: "try_home" },
      });
    }
  }

  return (
    <Link
      href="/"
      onClick={handleClick}
      className="auth-btn-primary inline-flex min-w-[220px] justify-center"
    >
      Try I Ching Oracle
    </Link>
  );
}
