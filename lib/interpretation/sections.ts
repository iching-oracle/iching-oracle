import type { InterpretationSectionId } from "@/types/interpretation";

export const INTERPRETATION_SECTIONS: Array<{
  id: InterpretationSectionId;
  title: string;
  header: string;
}> = [
  { id: "overall-reading", title: "Overall Reading", header: "## Overall Reading" },
  {
    id: "current-situation",
    title: "Current Situation",
    header: "## Current Situation",
  },
  {
    id: "hidden-obstacles",
    title: "Hidden Obstacles",
    header: "## Hidden Obstacles",
  },
  {
    id: "recommended-action",
    title: "Recommended Action",
    header: "## Recommended Action",
  },
  {
    id: "timing-momentum",
    title: "Timing / Momentum",
    header: "## Timing / Momentum",
  },
  {
    id: "emotional-insight",
    title: "Emotional Insight",
    header: "## Emotional Insight",
  },
  { id: "summary", title: "Summary", header: "## Summary" },
];

export const SECTION_HEADER_PATTERN =
  /^## (Overall Reading|Current Situation|Hidden Obstacles|Recommended Action|Timing \/ Momentum|Emotional Insight|Summary)\s*$/gm;
