import type { LearnArticle } from "@/types/seo";

export const LEARN_ARTICLES: LearnArticle[] = [
  {
    slug: "how-to-read-the-i-ching",
    title: "How to Read the I Ching",
    description:
      "A calm, modern guide to consulting the Book of Changes — question, cast, and contemplation.",
    publishedAt: "2026-01-15",
    readingMinutes: 8,
    tags: ["beginner", "practice"],
    sections: [
      {
        id: "stillness",
        heading: "Begin in stillness",
        body: "The I Ching responds to sincerity more than technique. Pause. Breathe. Hold one question — not ten.",
      },
      {
        id: "question",
        heading: "Craft your question",
        body: "Ask what you need to understand, not what you wish to hear. Open questions reveal more than yes/no demands.",
      },
      {
        id: "cast",
        heading: "Cast with attention",
        body: "Whether coins or yarrow, the act is ritual. Each line is a layer of the moment. Receive without rushing to judge.",
      },
      {
        id: "read",
        heading: "Read symbolically",
        body: "The hexagram is an image, not a verdict. Sit with judgment, changing lines, and transformed figures until something stirs in you.",
      },
    ],
  },
  {
    slug: "what-are-changing-lines",
    title: "What Are Changing Lines?",
    description:
      "Moving lines transform your reading — here is how to honor their motion.",
    publishedAt: "2026-02-01",
    readingMinutes: 6,
    tags: ["lines", "intermediate"],
    sections: [
      {
        id: "definition",
        heading: "Definition",
        body: "Lines with values 6 or 9 are changing. They indicate flux — what is becoming, not only what is.",
      },
      {
        id: "transformed",
        heading: "The transformed hexagram",
        body: "After changing lines resolve, a second hexagram appears. It often describes the trajectory, not the present snapshot.",
      },
    ],
  },
  {
    slug: "ancient-divination-in-the-ai-age",
    title: "Ancient Divination in the AI Age",
    description:
      "Why symbolic systems still matter when machines can speak — and how AI can serve reflection, not replace it.",
    publishedAt: "2026-03-10",
    readingMinutes: 7,
    tags: ["ai", "philosophy"],
    sections: [
      {
        id: "symbol",
        heading: "Symbols slow the mind",
        body: "Hexagrams resist instant answers. That friction is the medicine of divination.",
      },
      {
        id: "ai",
        heading: "AI as interpreter",
        body: "AI translation of classical imagery can clarify language barriers — yet the seeker must still choose meaning.",
      },
    ],
  },
  {
    slug: "how-ai-interprets-hexagrams",
    title: "How AI Interprets Hexagrams",
    description:
      "Inside our oracle: context, structure, and the ethics of machine-assisted wisdom.",
    publishedAt: "2026-04-05",
    readingMinutes: 5,
    tags: ["ai", "product"],
    sections: [
      {
        id: "context",
        heading: "Structured context",
        body: "We pass hexagram number, changing lines, question, and mode into a disciplined prompt — not free-form fortune telling.",
      },
      {
        id: "sections",
        heading: "Layered sections",
        body: "Interpretations unfold as present energy, hidden influence, and guidance — mirroring traditional commentary layers.",
      },
    ],
  },
];

export function getLearnArticle(slug: string): LearnArticle | null {
  return LEARN_ARTICLES.find((a) => a.slug === slug) ?? null;
}

export function listLearnPaths(): string[] {
  return ["/learn", ...LEARN_ARTICLES.map((a) => `/learn/${a.slug}`)];
}
