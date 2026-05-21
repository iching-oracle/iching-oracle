import type { ReadingCategory } from "@/types/reading-journal";

const CATEGORY_PATTERNS: Array<{
  category: ReadingCategory;
  patterns: RegExp[];
}> = [
  {
    category: "love",
    patterns: [
      /\b(love|relationship|partner|marriage|romance|dating|crush|breakup|divorce|boyfriend|girlfriend|spouse|heart)\b/i,
      /感情|愛情|戀愛|婚姻|伴侶/,
    ],
  },
  {
    category: "career",
    patterns: [
      /\b(career|job|work|promotion|boss|colleague|business|profession|interview|startup)\b/i,
      /事業|工作|職場|升遷|職業/,
    ],
  },
  {
    category: "finance",
    patterns: [
      /\b(money|finance|financial|investment|debt|salary|income|wealth|loan|savings)\b/i,
      /金錢|財運|投資|財務|收入/,
    ],
  },
  {
    category: "health",
    patterns: [
      /\b(health|illness|healing|body|medical|doctor|recovery|wellness|anxiety|stress)\b/i,
      /健康|疾病|身體|療癒|醫療/,
    ],
  },
  {
    category: "spirituality",
    patterns: [
      /\b(spiritual|soul|purpose|meditation|faith|divine|enlightenment|path|destiny)\b/i,
      /靈性|修行|靈魂|天命|覺醒/,
    ],
  },
  {
    category: "family",
    patterns: [
      /\b(family|parent|mother|father|child|children|sibling|home|relatives)\b/i,
      /家庭|父母|家人|親子|兄弟|姐妹/,
    ],
  },
];

/** Keyword-based category detection from the user's question. */
export function detectReadingCategory(question: string): ReadingCategory {
  const text = question.trim();
  if (!text) return "general";

  let best: ReadingCategory = "general";
  let bestScore = 0;

  for (const { category, patterns } of CATEGORY_PATTERNS) {
    let score = 0;
    for (const pattern of patterns) {
      if (pattern.test(text)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = category;
    }
  }

  return best;
}

export function isReadingCategory(value: string): value is ReadingCategory {
  return (
    value === "love" ||
    value === "career" ||
    value === "finance" ||
    value === "health" ||
    value === "spirituality" ||
    value === "family" ||
    value === "general"
  );
}

export function getCategoryLabel(category: ReadingCategory): string {
  const labels: Record<ReadingCategory, string> = {
    love: "Love",
    career: "Career",
    finance: "Finance",
    health: "Health",
    spirituality: "Spirituality",
    family: "Family",
    general: "General",
  };
  return labels[category];
}
