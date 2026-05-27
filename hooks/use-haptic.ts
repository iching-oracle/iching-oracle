"use client";

/** Light haptic for ceremony moments — no-op when unsupported. */
export function useHaptic() {
  const pulse = (pattern: number | number[] = 12) => {
    if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  };

  return { pulse };
}
