import type { ReadingCategory } from "@/types/reading-journal";

export type QuestionCategory = {
  id: ReadingCategory | "decisions";
  label: string;
  icon: string;
  description: string;
  prompts: string[];
};

export const QUESTION_CATEGORIES: QuestionCategory[] = [
  {
    id: "love",
    label: "Love",
    icon: "♡",
    description: "Matters of the heart",
    prompts: [
      "What is the true nature of this connection?",
      "Should I pursue this relationship?",
      "What does my heart need to understand now?",
    ],
  },
  {
    id: "career",
    label: "Career",
    icon: "☰",
    description: "Path and purpose at work",
    prompts: [
      "What is blocking my progress?",
      "Is this the right professional direction?",
      "How should I navigate this opportunity?",
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: "◎",
    description: "Material flow and security",
    prompts: [
      "What energy surrounds this financial decision?",
      "Where should I focus my resources?",
      "What lesson is hidden in this uncertainty?",
    ],
  },
  {
    id: "family",
    label: "Relationships",
    icon: "☯",
    description: "Bonds, family, and kinship",
    prompts: [
      "How can I heal this relationship?",
      "What role am I being asked to play?",
      "What unspoken truth needs gentle light?",
    ],
  },
  {
    id: "spirituality",
    label: "Spiritual Growth",
    icon: "✦",
    description: "Inner path and awakening",
    prompts: [
      "What is my soul learning in this season?",
      "How may I deepen my spiritual practice?",
      "What sign is the universe offering me?",
    ],
  },
  {
    id: "decisions",
    label: "Important Decisions",
    icon: "⚖",
    description: "Crossroads and choice",
    prompts: [
      "What should I consider before I choose?",
      "Which path honors my highest good?",
      "What would wisdom counsel at this threshold?",
    ],
  },
];

export const RANDOM_PROMPTS = QUESTION_CATEGORIES.flatMap((c) => c.prompts);

export function pickRandomPrompt(): string {
  return RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)]!;
}
