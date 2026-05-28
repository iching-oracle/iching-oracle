/** Ceremony & reveal pacing (ms). */
export const GUIDED_TIMING = {
  ritualMinMs: 4500,
  ritualMaxMs: 6000,
  ritualFadeMs: 600,
  revealBlockMs: 700,
  revealBlockMsReduced: 200,
  readingParagraphMs: 600,
  /** Legacy casting ceremony (unused in new flow). */
  castLineMs: 900,
  castBetweenMs: 350,
  welcomeLineMs: 2200,
  welcomePauseMs: 800,
  revealMetaStaggerMs: 600,
  revealSymbolMs: 1200,
  revealLineStaggerMs: 200,
} as const;

export function ritualDurationMs(reducedMotion: boolean): number {
  return reducedMotion ? 1500 : GUIDED_TIMING.ritualMinMs;
}

/** Approximate duration for legacy casting ceremony progress (sr-only). */
export function castTotalMs(reducedMotion: boolean): number {
  const lineMs = reducedMotion ? 280 : GUIDED_TIMING.castLineMs;
  const betweenMs = reducedMotion ? 80 : GUIDED_TIMING.castBetweenMs;
  return 6 * lineMs + 5 * betweenMs + (reducedMotion ? 200 : 600);
}
