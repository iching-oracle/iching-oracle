import "server-only";

import type { EmotionalToneMonth } from "@/types/insights";

type ToneSignals = {
  calm: number;
  seeking: number;
  turbulent: number;
  hopeful: number;
};

const TONE_RULES: Array<{ key: keyof ToneSignals; test: RegExp }> = [
  { key: "calm", test: /\b(calm|peace|still|quiet|rest|ground)\b/i },
  { key: "seeking", test: /\b(why|how|path|guidance|clarity|direction|meaning)\b/i },
  {
    key: "turbulent",
    test: /\b(stress|anxiety|fear|worry|conflict|pain|lost|overwhelm)\b/i,
  },
  { key: "hopeful", test: /\b(hope|grow|trust|open|ready|grateful|light)\b/i },
];

function scoreText(text: string): ToneSignals {
  const out: ToneSignals = { calm: 0, seeking: 0, turbulent: 0, hopeful: 0 };
  for (const { key, test } of TONE_RULES) {
    if (test.test(text)) out[key] += 1;
  }
  return out;
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(d: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(
    d,
  );
}

export function computeEmotionalToneByMonth(
  rows: Array<{ createdAt: Date; question: string; summary: string | null }>,
  locale = "en-US",
): EmotionalToneMonth[] {
  const buckets = new Map<string, ToneSignals & { sample: Date }>();

  for (const r of rows) {
    const key = monthKey(r.createdAt);
    const text = `${r.question} ${r.summary ?? ""}`;
    const scored = scoreText(text);
    const prev = buckets.get(key);
    if (prev) {
      prev.calm += scored.calm;
      prev.seeking += scored.seeking;
      prev.turbulent += scored.turbulent;
      prev.hopeful += scored.hopeful;
    } else {
      buckets.set(key, { ...scored, sample: r.createdAt });
    }
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([monthKey, v]) => ({
      monthKey,
      monthLabel: monthLabel(v.sample, locale),
      calm: v.calm,
      seeking: v.seeking,
      turbulent: v.turbulent,
      hopeful: v.hopeful,
    }));
}
