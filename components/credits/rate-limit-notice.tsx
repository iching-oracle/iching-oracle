"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CREDITS } from "@/lib/atmosphere/copy";

type RateLimitNoticeProps = {
  message: string;
  retryAfterSec?: number;
  remaining?: number;
  limit?: number;
  showUpgrade?: boolean;
  compact?: boolean;
};

function formatCountdown(totalSec: number): string {
  if (totalSec <= 0) return "now";
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function RateLimitNotice({
  message,
  retryAfterSec,
  remaining,
  limit,
  showUpgrade = true,
  compact = false,
}: RateLimitNoticeProps) {
  const [secondsLeft, setSecondsLeft] = useState(retryAfterSec ?? 0);

  useEffect(() => {
    if (!retryAfterSec || retryAfterSec <= 0) return;
    setSecondsLeft(retryAfterSec);
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [retryAfterSec]);

  const quotaHint =
    typeof remaining === "number" && typeof limit === "number"
      ? `${Math.max(0, remaining)} of ${limit} remaining`
      : null;

  if (compact) {
    return (
      <p className="text-sm text-zen-muted" role="status">
        {message}
        {secondsLeft > 0 ? ` Try again in ${formatCountdown(secondsLeft)}.` : null}
      </p>
    );
  }

  return (
    <div
      className="rounded-2xl border border-amber-gold/20 bg-amber-gold/5 p-5 text-sm"
      role="status"
    >
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-zen-muted">
        Gentle pause
      </p>
      <p className="mt-2 leading-relaxed text-foreground">{message}</p>
      {secondsLeft > 0 ? (
        <p className="mt-2 text-zen-muted">
          You can try again in{" "}
          <span className="font-medium text-amber-gold">
            {formatCountdown(secondsLeft)}
          </span>
          .
        </p>
      ) : null}
      {quotaHint ? (
        <p className="mt-1 text-xs text-zen-muted">{quotaHint}</p>
      ) : null}
      {showUpgrade ? (
        <Link
          href="/pricing"
          className="mt-4 inline-block text-sm text-amber-gold hover:underline"
        >
          {CREDITS.upgrade}
        </Link>
      ) : null}
    </div>
  );
}
