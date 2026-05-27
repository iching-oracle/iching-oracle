import { getHexagram } from "@/lib/hexagrams";
import { getChangingLines } from "@/lib/iching";
import { formatChangingLinesList } from "@/lib/readings/format";
import { getCategoryLabel } from "@/lib/readings/category";
import type { GuidedReadingResult } from "@/types/guided-reading";
import type { ShareCardReadingData } from "@/types/share";

export function buildGuidedShareCardData(
  result: GuidedReadingResult,
): ShareCardReadingData {
  const primary = getHexagram(result.hexagram);
  const transformed = result.transformedHexagram
    ? getHexagram(result.transformedHexagram)
    : null;

  return {
    question: result.question,
    quote: result.quote,
    primaryHexagram: {
      number: result.hexagram,
      title: result.primaryTitle,
      chineseName: result.chineseName,
    },
    resultingHexagram: transformed
      ? {
          number: result.transformedHexagram!,
          title: result.finalTitle ?? transformed.title,
          chineseName: transformed.chineseName,
        }
      : null,
    changingLinesLabel: formatChangingLinesList(
      getChangingLines(result.lineValues),
    ),
    categoryLabel: getCategoryLabel(result.category),
    dateLabel: new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(new Date()),
  };
}
