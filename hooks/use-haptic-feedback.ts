"use client";

/** Light tap feedback on supported devices (iOS Safari, Android Chrome). */
export function useHapticFeedback() {
  return function haptic(style: "light" | "medium" = "light") {
    if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
    try {
      const duration = style === "light" ? 8 : 14;
      navigator.vibrate(duration);
    } catch {
      /* ignore */
    }
  };
}
