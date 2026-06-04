/** Homepage copy — single source for landing sections. */

export const LANDING_HERO = {
  eyebrow: "易經 · Book of Changes",
  headline: "Clarity for the questions that matter.",
  subheadline:
    "Ancient wisdom meets modern AI. Receive a personalized I Ching reading—calm, private, and thoughtfully interpreted.",
  primaryCta: "Begin your reading",
  secondaryCta: "Explore Premium",
  loggedInPrimaryCta: "Continue to oracle",
} as const;

export const TRUST_PILLARS = [
  {
    title: "Privacy-first",
    description:
      "Your questions stay yours. We never sell personal reading data or use your practice for ads.",
  },
  {
    title: "AI-powered insight",
    description:
      "DeepSeek interprets each hexagram with context—structured, compassionate, and grounded in classical meaning.",
  },
  {
    title: "Secure payments",
    description:
      "Premium billing runs through Stripe. Cancel anytime from your account—no dark patterns.",
  },
  {
    title: "Personalized guidance",
    description:
      "Changing lines, transformed hexagrams, and memory-aware follow-ups adapt to your journey over time.",
  },
  {
    title: "Modern spiritual UX",
    description:
      "A quiet, premium interface designed for reflection—not spectacle or fortune-teller clichés.",
  },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Ask your question",
    description:
      "Pause, frame what you truly want to understand, and enter your inquiry with intention.",
  },
  {
    step: "02",
    title: "Receive your hexagram",
    description:
      "The oracle casts your lines—yarrow, coins, or mindful instant—revealing the pattern of the moment.",
  },
  {
    step: "03",
    title: "Get AI interpretation",
    description:
      "Receive a layered reading: judgment, changing lines, and practical insight you can return to.",
  },
] as const;

export const LANDING_TESTIMONIALS = [
  {
    quote:
      "I expected novelty. Instead I got a reading that felt eerily precise—like someone had named the tension I'd been avoiding for months.",
    name: "Elena M.",
    role: "Product designer, Berlin",
  },
  {
    quote:
      "The interface is so calm it actually slows me down. I use it before big decisions, not as entertainment.",
    name: "James K.",
    role: "Founder, London",
  },
  {
    quote:
      "Premium interpretations read like a thoughtful mentor—not a generic horoscope. Worth every euro for the depth.",
    name: "Sofia R.",
    role: "Coach & writer, Munich",
  },
] as const;

export const DIVINATION_METHODS = [
  {
    titleZh: "數位籌策",
    titleEn: "Digital yarrow",
    description:
      "The classical six-pass ritual—digitized with reverence for the original stalk method.",
  },
  {
    titleZh: "三錢問卜",
    titleEn: "Three coins",
    description:
      "Six tosses of three coins. Familiar, tactile logic translated into a serene digital flow.",
  },
  {
    titleZh: "一念即卦",
    titleEn: "Mindful instant",
    description:
      "When the question is clear and the moment is ripe—a single intention reveals the hexagram.",
  },
] as const;
