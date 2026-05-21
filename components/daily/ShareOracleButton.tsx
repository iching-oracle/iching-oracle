"use client";

import { useState } from "react";
import type { DailyOraclePayload } from "@/types/daily-oracle";
import { getHexagram } from "@/lib/hexagrams";

type ShareOracleButtonProps = {
  oracle: DailyOraclePayload;
};

function buildShareText(oracle: DailyOraclePayload): string {
  const hex = getHexagram(oracle.hexagramNumber);
  return [
    `ICHING-ORACLE · Daily Oracle · ${oracle.date}`,
    `Hexagram ${hex.number} ${hex.chineseName} — ${hex.title}`,
    "",
    oracle.oracleMessage,
    "",
    `"${oracle.reflectionQuote}"`,
    "",
    `Lucky focus: ${oracle.luckyFocus}`,
    "https://www.ichingoracle.de/daily",
  ].join("\n");
}

export function ShareOracleButton({ oracle }: ShareOracleButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildShareText(oracle));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleShare() {
    const text = buildShareText(oracle);
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Daily Oracle",
          text: oracle.reflectionQuote,
          url: `${window.location.origin}/daily`,
        });
        return;
      } catch {
        /* fall through */
      }
    }
    await handleCopy();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-full border border-white/10 px-4 py-2 text-xs text-zen-muted transition-colors hover:border-amber-gold/40 hover:text-amber-gold"
      >
        {copied ? "Copied" : "Copy oracle"}
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="rounded-full border border-amber-gold/30 bg-amber-gold/10 px-4 py-2 text-xs text-amber-glow transition-colors hover:bg-amber-gold/20"
      >
        Share
      </button>
    </div>
  );
}
