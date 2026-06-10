/** Homepage copy — conversion-focused, English-first. */

export const LANDING_HERO = {
  eyebrow: "I Ching Oracle",
  headline: "AI-Powered I Ching Readings in Seconds",
  subheadline:
    "Ask any question and receive personalized guidance based on the ancient wisdom of the I Ching.",
  primaryCta: "Start Free Reading",
  secondaryCta: "Explore the 64 Hexagrams",
  loggedInPrimaryCta: "Start a Reading",
  footnote: "Free to begin · Private · No credit card required",
} as const;

export const EXAMPLE_READING = {
  eyebrow: "Example reading",
  question: "Should I take the new opportunity that has opened in my career?",
  hexagramNumber: 49,
  interpretationPreview:
    "The moment favors transformation, not hesitation. Like fire beneath the lake, change is already stirring—your task is to align with it consciously. The reading suggests preparing thoroughly before you act, then committing with clarity rather than fear.",
  cta: "Try Your Own Reading",
} as const;

export const TRUST_PILLARS = [
  {
    title: "Based on all 64 I Ching hexagrams",
    description:
      "Every reading draws from the complete Book of Changes—classical judgments, changing lines, and transformed hexagrams.",
    icon: "hexagrams" as const,
  },
  {
    title: "AI-enhanced interpretations",
    description:
      "Modern language meets ancient structure. Insights are personalized to your question without losing the depth of tradition.",
    icon: "ai" as const,
  },
  {
    title: "Private and secure readings",
    description:
      "Your questions stay yours. We do not sell reading data or use your practice for advertising.",
    icon: "shield" as const,
  },
  {
    title: "Personal spiritual guidance",
    description:
      "Relationship, career, purpose, or inner life—receive reflection you can sit with, not slogans to obey.",
    icon: "guidance" as const,
  },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: "1",
    title: "Ask Your Question",
    description:
      "Name what you truly want to understand—a relationship, career crossroads, or inner uncertainty.",
    icon: "question" as const,
  },
  {
    step: "2",
    title: "Generate Your Hexagram",
    description:
      "The oracle casts your lines through a mindful ritual, revealing the pattern of this moment.",
    icon: "cast" as const,
  },
  {
    step: "3",
    title: "Receive AI-Powered Insight",
    description:
      "Read a thoughtful interpretation grounded in classical meaning and shaped to your situation.",
    icon: "insight" as const,
  },
] as const;

export const LANDING_FAQ = [
  {
    question: "What is the I Ching?",
    answer:
      "The I Ching, or Book of Changes, is one of the oldest spiritual texts in the world. For over three thousand years it has offered guidance through 64 hexagrams—six-line symbols that reflect patterns of change in life, relationships, and decision-making.",
  },
  {
    question: "How does AI interpret the I Ching?",
    answer:
      "Our AI reads your hexagram in full classical context—primary figure, changing lines, and transformed hexagram when present—then renders guidance in clear, compassionate language. It does not replace tradition; it makes centuries of wisdom accessible to your question today.",
  },
  {
    question: "Are readings private?",
    answer:
      "Yes. Your questions and readings are private by default. Sharing is optional and entirely under your control. We do not sell personal reading data.",
  },
  {
    question: "Can I ask relationship or career questions?",
    answer:
      "Absolutely. The I Ching has long been consulted for love, work, family, and life direction. Ask what is honest for you—the quality of the question shapes the quality of the reflection.",
  },
  {
    question: "What are hexagrams?",
    answer:
      "A hexagram is a figure of six stacked lines—solid or broken—representing yin and yang. There are 64 possible combinations, each with its own name, judgment, and imagery. Your reading selects the hexagram that mirrors your situation.",
  },
] as const;

export const LANDING_TESTIMONIALS = [
  {
    quote:
      "I came for curiosity. I stayed because the reading named a tension I had been carrying quietly for months—without telling me what to do.",
    name: "Elena M.",
    role: "Product designer, Berlin",
  },
  {
    quote:
      "The pace of the interface slows me down. I open it before difficult conversations, not to escape them.",
    name: "James K.",
    role: "Founder, London",
  },
  {
    quote:
      "Premium reads like a thoughtful letter—not a horoscope. The depth feels earned, not performed.",
    name: "Sofia R.",
    role: "Coach & writer, Munich",
  },
] as const;

export const DIVINATION_METHODS = [
  {
    titleEn: "Digital yarrow",
    accentZh: "籌",
    description:
      "The classical six-pass ritual—held with the same patience the stalk method asks of you.",
  },
  {
    titleEn: "Three coins",
    accentZh: "錢",
    description:
      "Six tosses, familiar logic. A rhythm you can feel in the body, translated into a serene flow.",
  },
  {
    titleEn: "Mindful instant",
    accentZh: "念",
    description:
      "When the question is clear and the moment is ripe—one intention, one hexagram, fully present.",
  },
] as const;

export const LANDING_SECTIONS = {
  example: {
    eyebrow: "See it in action",
    title: "A reading shaped to your question",
    description:
      "Every consultation follows the same sacred structure—question, hexagram, interpretation—delivered in seconds.",
  },
  trust: {
    eyebrow: "Why seekers trust us",
    title: "Ancient wisdom, thoughtfully delivered",
    description:
      "Built for clarity, privacy, and depth—the qualities a genuine spiritual practice deserves.",
  },
  howItWorks: {
    eyebrow: "How it works",
    title: "From question to insight in three steps",
    description:
      "No complexity. No theatre. Just a clear path from uncertainty to reflection.",
  },
  methods: {
    eyebrow: "Divination",
    title: "Choose the path that fits the moment",
    description:
      "Each method carries the weight of classical practice. Select the one that matches how present you are today.",
  },
  premium: {
    eyebrow: "Go deeper",
    title: "Unlock unlimited guidance",
    description:
      "Start free. Upgrade when you want deeper interpretation, pattern insights, and oracle conversations.",
  },
  testimonials: {
    eyebrow: "Voices",
    title: "Seekers who return",
    description:
      "Reflections from people who use the oracle as a companion—not a distraction.",
  },
  faq: {
    eyebrow: "Questions",
    title: "Frequently asked questions",
    description:
      "Everything you need to know before your first reading.",
  },
  waitlist: {
    eyebrow: "Early access",
    title: "Join the private beta",
    description:
      "We open invitations in small waves so the experience stays intimate. One personal note when your place is ready.",
  },
  finalCta: {
    headline: "Your next reading is one question away",
    subheadline:
      "Start free. Receive personalized I Ching guidance in seconds—private, thoughtful, and always available when you need perspective.",
    primaryLoggedOut: "Start Free Reading",
    primaryLoggedIn: "Start a Reading",
    secondary: "View pricing",
  },
} as const;
