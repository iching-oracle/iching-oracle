import type { InterpretationMode } from "@/types/interpretation";

export const INTERPRETATION_MODES: Array<{
  id: InterpretationMode;
  label: string;
  description: string;
}> = [
  {
    id: "traditional",
    label: "Traditional",
    description: "Classical I Ching wisdom and symbolic precision",
  },
  {
    id: "psychological",
    label: "Psychological",
    description: "Inner patterns, shadow, and conscious integration",
  },
  {
    id: "spiritual",
    label: "Spiritual",
    description: "Soul path, surrender, and transcendent perspective",
  },
  {
    id: "direct",
    label: "Direct",
    description: "Clear, practical counsel without ornament",
  },
];

const MODE_SYSTEM_INSTRUCTIONS: Record<InterpretationMode, string> = {
  traditional: `Interpretation mode: TRADITIONAL.
Speak as a seasoned I Ching scholar. Honor classical imagery, line statements, and hexagram relationships. Reference the Book of Changes with dignity — not as trivia, but as living symbolism.`,
  psychological: `Interpretation mode: PSYCHOLOGICAL.
Speak as a depth-oriented guide (Jungian-influenced). Map hexagram dynamics to inner conflict, projection, integration, and emotional patterns. Make the reading psychologically actionable.`,
  spiritual: `Interpretation mode: SPIRITUAL.
Speak as a contemplative mystic. Emphasize meaning, surrender, alignment, and the soul's movement through change. Avoid dogma; invite quiet revelation.`,
  direct: `Interpretation mode: DIRECT.
Speak plainly and concretely. No filler, no fortune-cookie phrasing. Name what is happening, what matters, and what to do next. Respect the seeker with honesty.`,
};

export function getModeSystemInstruction(mode: InterpretationMode): string {
  return MODE_SYSTEM_INSTRUCTIONS[mode];
}

export function isInterpretationMode(value: string): value is InterpretationMode {
  return (
    value === "traditional" ||
    value === "psychological" ||
    value === "spiritual" ||
    value === "direct"
  );
}
