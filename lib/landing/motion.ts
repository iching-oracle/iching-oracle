/** Calm, ceremonial motion presets for the marketing landing page. */

export const LANDING_EASE = [0.25, 0.1, 0.25, 1] as const;

export const LANDING_DURATION = 0.9;

export const LANDING_VIEWPORT = { once: true, margin: "-12%" as const };

export function landingTransition(
  reduceMotion: boolean | null,
  delay = 0,
  duration = LANDING_DURATION,
) {
  if (reduceMotion) return { duration: 0 };
  return { delay, duration, ease: LANDING_EASE };
}

export function landingInitial(reduceMotion: boolean | null, y = 18) {
  return reduceMotion ? false : { opacity: 0, y };
}
