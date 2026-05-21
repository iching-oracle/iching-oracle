import { INTERPRETATION_SECTIONS } from "@/lib/interpretation/sections";
import type {
  InterpretationSection,
  InterpretationSectionId,
  ParsedInterpretation,
} from "@/types/interpretation";
import type { InterpretationMode } from "@/types/interpretation";

const HEADER_TO_ID: Record<string, InterpretationSectionId> = {
  "Overall Reading": "overall-reading",
  "Current Situation": "current-situation",
  "Hidden Obstacles": "hidden-obstacles",
  "Recommended Action": "recommended-action",
  "Timing / Momentum": "timing-momentum",
  "Emotional Insight": "emotional-insight",
  Summary: "summary",
};

export function parseInterpretationSections(
  raw: string,
  mode: InterpretationMode = "traditional",
): ParsedInterpretation {
  const sections: InterpretationSection[] = [];
  const lines = raw.split("\n");
  let currentId: InterpretationSectionId | null = null;
  let buffer: string[] = [];

  function flush() {
    if (!currentId) return;
    const def = INTERPRETATION_SECTIONS.find((s) => s.id === currentId);
    sections.push({
      id: currentId,
      title: def?.title ?? currentId,
      content: buffer.join("\n").trim(),
    });
    buffer = [];
  }

  for (const line of lines) {
    const headerMatch = line.match(/^##\s+(.+)\s*$/);
    if (headerMatch) {
      flush();
      const title = headerMatch[1].trim();
      currentId = HEADER_TO_ID[title] ?? null;
      continue;
    }
    if (currentId) {
      buffer.push(line);
    }
  }
  flush();

  if (sections.length === 0 && raw.trim()) {
    sections.push({
      id: "overall-reading",
      title: "Overall Reading",
      content: raw.trim(),
    });
  }

  return { mode, sections, raw };
}

export function serializeInterpretation(
  parsed: ParsedInterpretation,
): string {
  return parsed.sections
    .map((s) => `## ${s.title}\n\n${s.content}`)
    .join("\n\n");
}

const ADVANCED_SECTION_HEADERS = [
  "## Overall Reading",
  "## Current Situation",
  "## Hidden Obstacles",
];

export function isAdvancedInterpretation(text: string): boolean {
  const trimmed = text.trim();
  return ADVANCED_SECTION_HEADERS.some((header) => trimmed.includes(header));
}
