"use client";

import { useEffect, useState } from "react";

/** Reveals text progressively for cinematic reading (full text already available). */
export function useSimulatedStream(
  fullText: string,
  enabled: boolean,
  charsPerTick = 8,
  intervalMs = 24,
): string {
  const [visible, setVisible] = useState(enabled ? "" : fullText);

  useEffect(() => {
    if (!enabled) {
      setVisible(fullText);
      return;
    }

    setVisible("");
    let index = 0;
    const id = window.setInterval(() => {
      index = Math.min(fullText.length, index + charsPerTick);
      setVisible(fullText.slice(0, index));
      if (index >= fullText.length) {
        window.clearInterval(id);
      }
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [fullText, enabled, charsPerTick, intervalMs]);

  return visible;
}
