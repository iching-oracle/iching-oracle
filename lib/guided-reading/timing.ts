/** Ceremony pacing (ms) — tuned for ~10–14s total with reduced-motion shortcuts. */
export const GUIDED_TIMING = {
  welcomeLineMs: 2200,
  welcomePauseMs: 800,
  castLineMs: 1400,
  castBetweenMs: 400,
  castMinDurationMs: 9000,
  revealSymbolMs: 1200,
  revealLineStaggerMs: 350,
  revealMetaStaggerMs: 500,
  readingParagraphMs: 600,
} as const;

export function castTotalMs(reducedMotion: boolean): number {
  if (reducedMotion) return 2000;
  return (
    GUIDED_TIMING.castLineMs * 6 +
    GUIDED_TIMING.castBetweenMs * 5
  );
}
