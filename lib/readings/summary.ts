import { isAdvancedInterpretation, parseInterpretationSections } from "@/lib/interpretation/parse";
import { truncate } from "@/lib/truncate";

const SUMMARY_MAX = 280;

/** Extract a display summary from stored interpretation text. */
export function extractReadingSummary(interpretation: string): string {
  const trimmed = interpretation.trim();
  if (!trimmed) return "";

  if (isAdvancedInterpretation(trimmed)) {
    const parsed = parseInterpretationSections(trimmed);
    const summarySection = parsed.sections.find((s) => s.id === "summary");
    if (summarySection?.content.trim()) {
      return truncate(summarySection.content.trim(), SUMMARY_MAX);
    }
    const overall = parsed.sections.find((s) => s.id === "overall-reading");
    if (overall?.content.trim()) {
      return truncate(overall.content.trim(), SUMMARY_MAX);
    }
  }

  if (trimmed.startsWith("#")) {
    const withoutTitle = trimmed.replace(/^#+\s+[^\n]+\n+/m, "").trim();
    return truncate(withoutTitle, SUMMARY_MAX);
  }

  return truncate(trimmed, SUMMARY_MAX);
}
