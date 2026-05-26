import { extractReadingSummary } from "@/lib/readings/summary";

const MAX_QUOTE = 220;

export function sanitizeShareText(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/\0/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractShareQuote(interpretation: string, summary?: string | null): string {
  const fromSummary = summary?.trim();
  if (fromSummary) {
    return truncateQuote(sanitizeShareText(fromSummary));
  }

  const extracted = extractReadingSummary(interpretation);
  if (extracted && !extracted.startsWith("# Premium")) {
    return truncateQuote(sanitizeShareText(extracted));
  }

  const plain = sanitizeShareText(
    interpretation.replace(/^#+\s+[^\n]+\n+/gm, "").trim(),
  );
  return truncateQuote(plain || "The oracle speaks in symbols — reflect on what resonates.");
}

function truncateQuote(text: string): string {
  if (text.length <= MAX_QUOTE) return text;
  const cut = text.lastIndexOf(" ", MAX_QUOTE);
  return `${text.slice(0, cut > 80 ? cut : MAX_QUOTE).trim()}…`;
}
