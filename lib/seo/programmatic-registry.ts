import type { HexagramTopic, ProgrammaticPageDef } from "@/types/seo";

const CLUSTER_PAGES: Array<{
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  intro: string;
  body: string;
}> = [
  {
    slug: "i-ching-guidance-for-relationships",
    title: "I Ching Guidance for Relationships",
    metaTitle: "I Ching Guidance for Relationships | AI Oracle",
    metaDescription:
      "Explore how the I Ching illuminates love, partnership, and emotional truth — with AI interpretation for modern seekers.",
    keywords: ["i ching love", "relationship guidance", "hexagram love"],
    intro:
      "Relationships are living patterns — they deepen, fracture, and renew. The I Ching does not judge your heart; it clarifies the energy between you and another.",
    body: "Ask with sincerity about trust, timing, or reconciliation. Let changing lines reveal what is still in motion versus what has settled.",
  },
  {
    slug: "i-ching-career-decisions",
    title: "I Ching for Career Decisions",
    metaTitle: "I Ching Career Decisions & Timing | AI Oracle",
    metaDescription:
      "Ancient Chinese divination for career crossroads — promotions, pivots, and purposeful work interpreted through AI.",
    keywords: ["i ching career", "career hexagram", "work guidance"],
    intro:
      "Career questions often hide a deeper ask: Am I aligned? The oracle responds to clarity of intention, not anxiety.",
    body: "Frame one decision at a time. Notice whether your cast emphasizes waiting, advance, or consolidation.",
  },
  {
    slug: "what-are-changing-lines",
    title: "What Are Changing Lines?",
    metaTitle: "What Are Changing Lines in the I Ching? | Guide",
    metaDescription:
      "Understand changing lines (moving lines) in I Ching readings — how they transform hexagrams and deepen interpretation.",
    keywords: ["changing lines", "moving lines", "i ching lines"],
    intro:
      "Changing lines are the pulse of a reading — they mark where the situation is not static.",
    body: "Lines valued 6 or 9 are changing. They yield a transformed hexagram describing the trend of events.",
  },
  {
    slug: "ai-oracle-career-decisions",
    title: "AI Oracle for Career Decisions",
    metaTitle: "AI I Ching Oracle for Career Decisions",
    metaDescription:
      "Consult an AI I Ching oracle for career clarity — ancient symbols, modern language, private and reflective.",
    keywords: ["ai oracle", "i ching ai", "career oracle"],
    intro:
      "AI does not replace intuition; it articulates the pattern the hexagram already holds.",
    body: "Receive structured insight: situation, hidden influence, guidance, and reflection prompts.",
  },
  {
    slug: "ancient-chinese-divination-meaning",
    title: "Ancient Chinese Divination Meaning",
    metaTitle: "Ancient Chinese Divination & the I Ching",
    metaDescription:
      "What is ancient Chinese divination? How the I Ching became a timeless mirror for decision-making.",
    keywords: ["chinese divination", "i ching history", "oracle meaning"],
    intro:
      "For three thousand years, seekers have cast symbols to see themselves more clearly.",
    body: "The I Ching maps change itself — not fixed fate, but the quality of the moment.",
  },
];

function hexagramMeaningSlug(n: number, topic?: HexagramTopic): string {
  if (topic === "love") return `hexagram-${n}-meaning-in-love`;
  if (topic === "career") return `hexagram-${n}-career-meaning`;
  if (topic === "spirituality") return `hexagram-${n}-spiritual-meaning`;
  return `what-does-hexagram-${n}-mean`;
}

export function buildProgrammaticRegistry(): ProgrammaticPageDef[] {
  const pages: ProgrammaticPageDef[] = CLUSTER_PAGES.map((c) => ({
    slug: c.slug,
    type: "topic_cluster",
    templateKey: "topic_cluster",
    title: c.title,
    metaTitle: c.metaTitle,
    metaDescription: c.metaDescription,
    canonicalPath: `/guides/${c.slug}`,
    blocks: [
      { id: "intro", heading: "Overview", body: c.intro },
      { id: "body", heading: "How to work with this wisdom", body: c.body },
    ],
    faqs: [
      {
        question: `How can the I Ching help with ${c.title.toLowerCase()}?`,
        answer: c.intro,
      },
    ],
  }));

  for (let n = 1; n <= 64; n++) {
    const topics: Array<HexagramTopic | undefined> = [
      undefined,
      "love",
      "career",
      "spirituality",
    ];
    for (const topic of topics) {
      const slug = hexagramMeaningSlug(n, topic);
      const label = topic ?? "general";
      pages.push({
        slug,
        type: "guide",
        templateKey: "hexagram_meaning",
        hexagramNumber: n,
        topic: topic ?? "general",
        title: `What does Hexagram ${n} mean${topic ? ` in ${label}` : ""}?`,
        metaTitle: `Hexagram ${n} Meaning${topic ? ` in ${label}` : ""} | I Ching Oracle`,
        metaDescription: `Learn the meaning of I Ching Hexagram ${n}${topic ? ` for ${label}` : ""} — symbols, guidance, and AI interpretation.`,
        canonicalPath: `/guides/${slug}`,
        blocks: [
          {
            id: "meaning",
            heading: "Core meaning",
            body: `Hexagram ${n} carries a distinct quality of change. Explore the full hexagram page for traditional judgment, modern insight, and changing lines.`,
          },
        ],
        faqs: [
          {
            question: `What is Hexagram ${n}?`,
            answer: `See the complete hexagram reference for judgment, lines, and related symbols.`,
          },
        ],
      });
    }
  }

  return pages;
}

const REGISTRY = buildProgrammaticRegistry();

export function getProgrammaticPage(slug: string): ProgrammaticPageDef | null {
  return REGISTRY.find((p) => p.slug === slug) ?? null;
}

export function listProgrammaticPaths(): string[] {
  return REGISTRY.map((p) => p.canonicalPath);
}

export function getRegistrySize(): number {
  return REGISTRY.length;
}
