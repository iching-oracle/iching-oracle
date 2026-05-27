/** Client-safe premium placeholder detection (no server imports). */

const PREMIUM_PREVIEW_MARKERS = [
  "# Premium Interpretation Preview",
  "# Premium-Interpretation (Vorschau)",
  "# 高级解读预览",
] as const;

export function isPremiumInterpretationPreview(text: string): boolean {
  const trimmed = text.trim();
  return PREMIUM_PREVIEW_MARKERS.some((marker) => trimmed.startsWith(marker));
}
