import { getHexagram } from "@/lib/hexagrams";
import { getRelatedHexagramNumbers } from "@/lib/seo/hexagram-related";
import { hexagramBaseSlug, hexagramTopicSlug } from "@/lib/seo/slugs";
import type { HexagramSeoContent, HexagramTopic, SeoFaqItem } from "@/types/seo";

const TOPIC_LABELS: Record<HexagramTopic, string> = {
  love: "Love & Relationships",
  career: "Career & Purpose",
  spirituality: "Spiritual Growth",
  general: "Life Guidance",
};

const TOPIC_INTROS: Record<HexagramTopic, (title: string) => string> = {
  love: (title) =>
    `In matters of the heart, ${title} invites sincere reflection on connection, trust, and emotional truth.`,
  career: (title) =>
    `For career and purpose, ${title} illuminates timing, leadership, and the path of meaningful work.`,
  spirituality: (title) =>
    `On the spiritual path, ${title} speaks to inner alignment, surrender, and awakening.`,
  general: (title) =>
    `${title} offers timeless guidance for the crossroads of daily life.`,
};

const CHANGING_LINE_THEMES = [
  "The foundation stirs — attend to what is beginning in silence.",
  "Inner alignment — balance feeling with clear intention.",
  "The turning point — act without forcing; let timing ripen.",
  "Stability tested — strengthen boundaries with compassion.",
  "The summit — leadership and visibility require humility.",
  "Completion approaches — release what the cycle no longer needs.",
];

export function getHexagramTopicPath(
  number: number,
  topic: HexagramTopic,
): string {
  if (topic === "general") return `/hexagrams/${number}`;
  return `/hexagrams/${number}/${topic}`;
}

export function buildHexagramSeoContent(
  number: number,
  topic: HexagramTopic = "general",
): HexagramSeoContent {
  const hex = getHexagram(number);
  const topicLabel = TOPIC_LABELS[topic];
  const canonicalPath = getHexagramTopicPath(number, topic);
  const slug =
    topic === "general" ? hexagramBaseSlug(number) : hexagramTopicSlug(number, topic);

  const traditionalMeaning = hex.judgment;
  const modernInterpretation = `${TOPIC_INTROS[topic](hex.title)} The oracle does not predict a fixed fate — it reveals the quality of energy present now, so you may respond with wisdom rather than fear.`;

  const aiInsight = `When interpreted through AI, ${hex.title} (${hex.chineseName}) highlights patterns you may overlook: recurring themes in your question, emotional undertones, and practical next steps. Treat this as a mirror for contemplation, not a command.`;

  const changingLines = CHANGING_LINE_THEMES.map((meaning, i) => ({
    line: i + 1,
    meaning: `Line ${i + 1}: ${meaning}`,
  }));

  const faqs: SeoFaqItem[] = [
    {
      question: `What does Hexagram ${number} mean?`,
      answer: `${hex.title} (${hex.chineseName}) — ${hex.judgment}`,
    },
    {
      question: `What does Hexagram ${number} mean in ${topicLabel.toLowerCase()}?`,
      answer: modernInterpretation,
    },
    {
      question: "How do changing lines affect this hexagram?",
      answer:
        "Changing lines mark where energy is in motion. They point to evolving situations and often suggest a transformed hexagram that describes where the pattern is heading.",
    },
  ];

  const metaTitle =
    topic === "general"
      ? `Hexagram ${number} — ${hex.englishName} Meaning | AI I Ching Oracle`
      : `Hexagram ${number} in ${topicLabel} | ${hex.englishName}`;

  const metaDescription = `Discover the meaning of Hexagram ${number} (${hex.chineseName}) in ${topicLabel.toLowerCase()} — ${hex.judgment.slice(0, 100)}… Ancient wisdom interpreted by AI.`;

  const blocks = [
    {
      id: "traditional",
      heading: "Traditional Meaning",
      body: traditionalMeaning,
    },
    {
      id: "modern",
      heading: "Modern Interpretation",
      body: modernInterpretation,
    },
    {
      id: "ai",
      heading: "AI-Enhanced Insight",
      body: aiInsight,
    },
    {
      id: "lines",
      heading: "Changing Lines",
      body: changingLines.map((l) => l.meaning).join("\n\n"),
    },
  ];

  return {
    number,
    chineseName: hex.chineseName,
    englishName: hex.englishName,
    title: hex.title,
    judgment: hex.judgment,
    topic,
    metaTitle,
    metaDescription,
    canonicalPath,
    traditionalMeaning,
    modernInterpretation,
    aiInsight,
    changingLines,
    faqs,
    relatedHexagrams: getRelatedHexagramNumbers(number),
    blocks,
  };
}

export function listAllHexagramPaths(): string[] {
  const paths: string[] = ["/hexagrams"];
  const topics: HexagramTopic[] = [
    "general",
    "love",
    "career",
    "spirituality",
  ];

  for (let n = 1; n <= 64; n++) {
    for (const topic of topics) {
      if (topic === "general") {
        paths.push(`/hexagrams/${n}`);
      } else {
        paths.push(`/hexagrams/${n}/${topic}`);
      }
    }
  }
  return paths;
}
