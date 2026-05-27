import { extractReadingSummary } from "@/lib/readings/summary";
import {
  isAdvancedInterpretation,
  parseInterpretationSections,
} from "@/lib/interpretation/parse";
import { isPremiumInterpretationPreview } from "@/lib/premium-preview";
import type { DisplaySection } from "@/types/guided-reading";

const SECTION_TITLES: Record<string, string> = {
  "overall-reading": "Core Meaning",
  "current-situation": "Present Energy",
  "hidden-obstacles": "Hidden Influence",
  "recommended-action": "Guidance",
  "timing-momentum": "Timing & Momentum",
  "emotional-insight": "Emotional Insight",
  summary: "Reflection Prompt",
};

const PREMIUM_SECTION_IDS = new Set([
  "hidden-obstacles",
  "timing-momentum",
  "emotional-insight",
]);

export function mapInterpretationToDisplaySections(
  interpretation: string,
  isPremium: boolean,
): DisplaySection[] {
  const trimmed = interpretation.trim();

  if (isPremiumInterpretationPreview(trimmed) || !isAdvancedInterpretation(trimmed)) {
    const quote = extractReadingSummary(trimmed) || trimmed.slice(0, 400);
    return [
      {
        id: "core",
        title: "Core Meaning",
        content: quote,
      },
      {
        id: "reflection",
        title: "Reflection Prompt",
        content:
          "Sit with this image quietly. What truth in your question already knows the answer?",
        premiumOnly: false,
      },
      {
        id: "pattern",
        title: "Pattern Insight",
        content: "",
        premiumOnly: true,
      },
      {
        id: "trajectory",
        title: "Future Trajectory",
        content: "",
        premiumOnly: true,
      },
      {
        id: "emotional",
        title: "Emotional Analysis",
        content: "",
        premiumOnly: true,
      },
    ];
  }

  const parsed = parseInterpretationSections(trimmed);
  const sections: DisplaySection[] = parsed.sections
    .filter((s) => s.content.trim())
    .map((s) => ({
      id: s.id,
      title: SECTION_TITLES[s.id] ?? s.title,
      content: s.content,
      premiumOnly: !isPremium && PREMIUM_SECTION_IDS.has(s.id),
    }));

  if (sections.length === 0) {
    return [
      {
        id: "core",
        title: "Core Meaning",
        content: trimmed.slice(0, 500),
      },
    ];
  }

  if (!sections.some((s) => s.id === "summary" || s.title === "Reflection Prompt")) {
    sections.push({
      id: "reflection",
      title: "Reflection Prompt",
      content:
        "Which phrase from this reading stirs something in you? Return to it in stillness.",
      premiumOnly: false,
    });
  }

  if (!isPremium) {
    sections.push(
      {
        id: "pattern-insight",
        title: "Pattern Insight",
        content: "",
        premiumOnly: true,
      },
      {
        id: "trajectory",
        title: "Future Trajectory",
        content: "",
        premiumOnly: true,
      },
    );
  }

  return sections;
}
