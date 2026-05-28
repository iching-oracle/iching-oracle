import { getChangingLines } from "@/lib/iching";
import { formatChangingLinesList } from "@/lib/readings/format";
import { mapInterpretationToDisplaySections } from "@/lib/guided-reading/sections";
import type { GuidedReadingResult, RevealBlock } from "@/types/guided-reading";

export function buildProgressiveRevealBlocks(
  result: GuidedReadingResult,
  interpretation: string,
): RevealBlock[] {
  const blocks: RevealBlock[] = [
    { type: "hexagram", id: "hexagram-viz" },
    { type: "hexagram-name", id: "hexagram-name" },
    {
      type: "core-meaning",
      id: "core-meaning",
      content: result.judgment,
    },
  ];

  const sections = mapInterpretationToDisplaySections(
    interpretation,
    result.isPremium,
  );

  let guidanceContent = "";
  let reflectionContent = "";

  for (const section of sections) {
    if (section.premiumOnly) {
      blocks.push({
        type: "interpretation",
        id: section.id,
        title: section.title,
        content: section.content,
        premiumOnly: true,
      });
      continue;
    }

    const titleLower = section.title.toLowerCase();
    if (
      titleLower.includes("guidance") ||
      titleLower.includes("action") ||
      titleLower.includes("recommended")
    ) {
      guidanceContent = section.content;
      continue;
    }
    if (
      titleLower.includes("reflection") ||
      section.id === "summary" ||
      section.id === "reflection"
    ) {
      reflectionContent = section.content;
      continue;
    }
    if (section.id === "core" || section.title === "Core Meaning") {
      if (section.content && section.content !== result.judgment) {
        blocks.push({
          type: "interpretation",
          id: "ai-core",
          title: "Oracle interpretation",
          content: section.content,
        });
      }
      continue;
    }

    blocks.push({
      type: "interpretation",
      id: section.id,
      title: section.title,
      content: section.content,
    });
  }

  const changing = getChangingLines(result.lineValues);
  if (changing.length > 0) {
    const lineText =
      changing.length === 1
        ? `Line ${changing[0]} is in motion — energy is shifting at the foundation of this reading.`
        : `Lines ${formatChangingLinesList(changing)} are changing. The situation is evolving; attend to what is in flux rather than what has settled.`;
    blocks.push({
      type: "changing-lines",
      id: "changing-lines",
      content: lineText,
    });
    if (result.transformedHexagram && result.finalTitle) {
      blocks.push({
        type: "changing-lines",
        id: "transformed",
        content: `The reading moves toward ${result.finalTitle} — a picture of where this energy may lead.`,
      });
    }
  }

  if (guidanceContent) {
    blocks.push({
      type: "guidance",
      id: "guidance",
      content: guidanceContent,
    });
  }

  blocks.push({
    type: "reflection",
    id: "reflection",
    content:
      reflectionContent ||
      "Which phrase from this reading stirs something in you? Sit with it quietly before you act.",
  });

  return blocks;
}
