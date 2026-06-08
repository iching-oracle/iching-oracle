/** Contemplative, English-first copy — calm ritual tone, not SaaS. */

export const LOADING = {
  unfolding: "Letting the pattern emerge…",
  observing: "Observing the changing lines…",
  consulting: "Consulting the oracle quietly…",
  casting: "The lines are taking form…",
  composing: "Allowing the reading to settle…",
} as const;

export const READING_CLOSINGS = [
  "Sit with this for a while.",
  "Return when the moment changes.",
  "Not every answer arrives immediately.",
  "Let the reading breathe before you act.",
  "What you carry from here is yours alone.",
] as const;

export const CONTINUITY = {
  familiarTheme: "A familiar theme seems to return.",
  uncertainty: "You often arrive here during moments of uncertainty.",
  returning: "Welcome back — the oracle remembers your path.",
  firstVisit: "Your first chapter begins quietly here.",
} as const;

export const EMPTY = {
  journal: {
    title: "A quiet journal awaits",
    body: "Each consultation you save becomes a line in your reflective path — questions, hexagrams, and insight held in time.",
    cta: "Begin a reading",
    filteredTitle: "Nothing matches these filters",
    filteredBody: "Adjust your search — or return to the full journal.",
  },
  history: {
    title: "Your path begins with one honest question",
    body: "Consultations you save will gather here — hexagrams, changing lines, and the oracle's response, waiting for your return.",
    cta: "Begin a reading",
  },
  insights: {
    title: "Patterns reveal themselves in time",
    body: "After a few saved consultations, recurring themes may surface — gently, without hurry.",
    cta: "Begin a reading",
  },
  streak: {
    title: "A rhythm, not a score",
    body: "Visit the daily oracle when you can. Presence grows quietly over time.",
    cta: "Today's oracle",
  },
  dailyHistory: {
    body: "Your daily oracles will gather here — one quiet note for each day you return.",
  },
  dashboard: {
    title: "No readings yet",
    body: "When something weighs on your heart, bring it here.",
    cta: "Begin a reading",
  },
} as const;

export const CREDITS = {
  label: "consultations",
  low: "Your consultations for this period are running low.",
  insufficient: "You have reached your limit for this period.",
  premium: "This reflection requires a deeper tier.",
  billing: "Usage & membership",
  notNow: "Not now",
  upgrade: "Explore membership",
} as const;

export function pickReadingClosing(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % READING_CLOSINGS.length;
  }
  return READING_CLOSINGS[hash] ?? READING_CLOSINGS[0];
}
