import "server-only";

import { LANGUAGE_INSTRUCTIONS } from "@/lib/i18n/languages";
import { getModeSystemInstruction } from "@/lib/interpretation/modes";
import { INTERPRETATION_SECTIONS } from "@/lib/interpretation/sections";
import type { OracleReadingContext } from "@/types/interpretation";

const ADVANCED_SYSTEM_PROMPT = `You are the I Ching Oracle — a master of change, symbol, and human depth.

RULES (non-negotiable):
- Never sound like a generic AI assistant. No "in conclusion", "it's important to note", or hollow encouragement.
- Avoid fortune-cookie platitudes. Every sentence must earn its place.
- Weave changing lines naturally into the narrative — they are turning points, not a list.
- Make the reading feel personal to the seeker's exact question.
- Connect primary hexagram → changing lines → resulting hexagram as a living story of transformation.
- Be wise, precise, and compassionate. Vary sentence rhythm. Use vivid but restrained imagery.

OUTPUT FORMAT:
Respond ONLY in markdown using EXACTLY these section headers in this order (headers in English for parsing):

${INTERPRETATION_SECTIONS.map((s) => s.header).join("\n")}

Under each header write 2–4 substantial paragraphs (Summary: 1–2 concise paragraphs).
Do not add extra sections or preamble.`;

export function buildAdvancedSystemPrompt(context: OracleReadingContext): string {
  const languageInstruction =
    LANGUAGE_INSTRUCTIONS[context.language as keyof typeof LANGUAGE_INSTRUCTIONS] ??
    LANGUAGE_INSTRUCTIONS.de;

  return [
    ADVANCED_SYSTEM_PROMPT,
    getModeSystemInstruction(context.mode),
    languageInstruction,
  ].join("\n\n");
}

export function buildAdvancedUserPrompt(context: OracleReadingContext): string {
  const changingBlock =
    context.changingLines.length > 0
      ? context.changingLines
          .map(
            (line) =>
              `- Line ${line.position} (value ${line.lineValue}): ${line.meaning}`,
          )
          .join("\n")
      : "No changing lines — the primary hexagram holds steady.";

  const transformedBlock = context.transformedHexagram
    ? `Resulting hexagram (變卦): #${context.transformedHexagram.number} ${context.transformedHexagram.title}
Judgment: ${context.transformedHexagram.judgment}`
    : "No resulting hexagram — situation is stable without transforming lines.";

  return `
SEEKER'S QUESTION:
${context.question}

EMOTIONAL CONTEXT (for tone calibration):
${context.emotionalContext}

PRIMARY HEXAGRAM (本卦): #${context.primaryHexagram.number} ${context.primaryHexagram.title} (${context.primaryHexagram.chineseName})
Judgment: ${context.primaryHexagram.judgment}

CHANGING LINES (動爻):
${changingBlock}

${transformedBlock}

LINE VALUES (bottom to top): ${context.lineValues.join(", ")}

Answer the seeker's question through the full arc of this cast. Make each section distinct in focus while forming one coherent oracle reading.
`.trim();
}
