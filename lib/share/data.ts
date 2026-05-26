import "server-only";

import { getHexagram } from "@/lib/hexagrams";
import { parseChangingLines } from "@/lib/iching";
import { getCategoryLabel, isReadingCategory } from "@/lib/readings/category";
import { formatChangingLinesList } from "@/lib/readings/format";
import { extractShareQuote } from "@/lib/share/quote";
import type { ShareCardReadingData } from "@/types/share";
import type { Reading } from "@prisma/client";

export function buildShareCardData(
  reading: Pick<
    Reading,
    | "question"
    | "hexagram"
    | "primaryHexagramName"
    | "transformedHexagram"
    | "finalHexagramName"
    | "changingLines"
    | "interpretation"
    | "summary"
    | "category"
    | "createdAt"
  >,
  locale = "en-US",
): ShareCardReadingData {
  const primary = getHexagram(reading.hexagram);
  const transformed = reading.transformedHexagram
    ? getHexagram(reading.transformedHexagram)
    : null;

  const dateLabel = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
  }).format(reading.createdAt);

  const category = isReadingCategory(reading.category)
    ? reading.category
    : "general";

  return {
    question: reading.question.trim(),
    quote: extractShareQuote(reading.interpretation, reading.summary),
    primaryHexagram: {
      number: primary.number,
      title: reading.primaryHexagramName ?? primary.title,
      chineseName: primary.chineseName,
    },
    resultingHexagram: transformed
      ? {
          number: transformed.number,
          title: reading.finalHexagramName ?? transformed.title,
          chineseName: transformed.chineseName,
        }
      : null,
    changingLinesLabel: formatChangingLinesList(
      parseChangingLines(reading.changingLines),
    ),
    categoryLabel: getCategoryLabel(category),
    dateLabel,
  };
}
