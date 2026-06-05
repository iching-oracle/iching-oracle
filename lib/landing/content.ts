/** Homepage copy — single source for landing sections. */

export const LANDING_HERO = {
  eyebrow: "易經 · A quiet space for reflection",
  headline: "Moments of uncertainty deserve clarity.",
  subheadline:
    "Ancient wisdom, interpreted thoughtfully. Enter with your question—leave with perspective you can sit with, not slogans to obey.",
  primaryCta: "Begin your reading",
  secondaryCta: "Explore Premium",
  loggedInPrimaryCta: "Return to the oracle",
  footnote: "Begin freely · No card required to start",
} as const;

export const TRUST_PILLARS = [
  {
    title: "Your questions stay private",
    description:
      "What you ask belongs to you. We do not sell reading data or turn your practice into advertising.",
  },
  {
    title: "Thoughtful interpretation",
    description:
      "Each hexagram is read in context—structured, compassionate, and grounded in classical meaning, not hype.",
  },
  {
    title: "Honest billing",
    description:
      "Premium runs through Stripe. Cancel when you wish—no pressure, no dark patterns.",
  },
  {
    title: "A companion over time",
    description:
      "Changing lines, transformed hexagrams, and memory-aware follow-ups grow with your journal—not against it.",
  },
  {
    title: "Designed for stillness",
    description:
      "A calm interface for reflection. No spectacle, no fortune-teller theatre—only room to think.",
  },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: "I",
    title: "Pause with your question",
    description:
      "Name what you truly want to understand. The quality of the inquiry shapes the quality of the reflection.",
  },
  {
    step: "II",
    title: "Receive the hexagram",
    description:
      "The oracle casts your lines—yarrow, coins, or a mindful instant—revealing the pattern of this moment.",
  },
  {
    step: "III",
    title: "Sit with the interpretation",
    description:
      "Read judgment, changing lines, and gentle insight you can return to—not rush through and forget.",
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
    titleZh: "數位籌策",
    titleEn: "Digital yarrow",
    description:
      "The classical six-pass ritual—held with the same patience the stalk method asks of you.",
  },
  {
    titleZh: "三錢問卜",
    titleEn: "Three coins",
    description:
      "Six tosses, familiar logic. A rhythm you can feel in the body, translated into a serene flow.",
  },
  {
    titleZh: "一念即卦",
    titleEn: "Mindful instant",
    description:
      "When the question is clear and the moment is ripe—one intention, one hexagram, fully present.",
  },
] as const;

export const LANDING_SECTIONS = {
  trust: {
    eyebrow: "Trust",
    title: "A space worthy of your inner life",
    description:
      "Reflection asks for safety as much as beauty. Every layer is built so you can arrive honestly—and leave unhurried.",
  },
  howItWorks: {
    eyebrow: "The ritual",
    title: "Three movements from question to clarity",
    description:
      "The I Ching has guided seekers for millennia. We honor the pause between each step—not the hurry of another app.",
  },
  methods: {
    eyebrow: "Divination",
    title: "Choose the path that fits the moment",
    description:
      "Each method carries the weight of classical practice. Select the one that matches how present you are today.",
  },
  premium: {
    eyebrow: "Depth",
    title: "When you are ready to go further",
    description:
      "Begin in stillness. Deepen when your practice asks for more interpretation, memory, and pattern over time.",
  },
  testimonials: {
    eyebrow: "Voices",
    title: "Seekers who return",
    description:
      "Early reflections from people who use the oracle as a companion—not a distraction.",
  },
  waitlist: {
    eyebrow: "Early access",
    title: "Join the private beta",
    description:
      "We open invitations in small waves so the experience stays intimate. One personal note when your place is ready.",
  },
  finalCta: {
    headline: "Still your mind. Ask with care.",
    subheadline:
      "Your next reading begins with one honest question. Private, unhurried, and here whenever you need perspective—not certainty.",
    primaryLoggedOut: "Enter the oracle",
    primaryLoggedIn: "Continue your practice",
    secondary: "Daily oracle",
  },
} as const;
