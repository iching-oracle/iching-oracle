import "server-only";

import { getHexagram } from "@/lib/hexagrams";
import { parseChangingLines, parseLineValues } from "@/lib/iching";
import { normalizeLanguageCode } from "@/lib/i18n/languages";
import { formatChangingLinesList } from "@/lib/readings/format";
import type { OracleChatContext } from "@/types/chat";
import type { Reading } from "@prisma/client";

const INTERPRETATION_EXCERPT_MAX = 2400;

export function buildOracleChatContextFromReading(
  reading: Reading,
): OracleChatContext {
  const language = normalizeLanguageCode(reading.language);
  const primary = getHexagram(reading.hexagram);
  const transformed = reading.transformedHexagram
    ? getHexagram(reading.transformedHexagram)
    : null;
  const changingPositions = parseChangingLines(reading.changingLines);
  parseLineValues(reading.lineValues);

  const interpretationExcerpt =
    reading.interpretation.length > INTERPRETATION_EXCERPT_MAX
      ? `${reading.interpretation.slice(0, INTERPRETATION_EXCERPT_MAX).trim()}…`
      : reading.interpretation.trim();

  return {
    question: reading.question,
    language,
    primaryHexagram: {
      number: primary.number,
      title: primary.title,
      chineseName: primary.chineseName,
      judgment: primary.judgment,
    },
    transformedHexagram: transformed
      ? {
          number: transformed.number,
          title: transformed.title,
          chineseName: transformed.chineseName,
        }
      : null,
    changingLinesSummary: formatChangingLinesList(changingPositions),
    interpretationExcerpt,
  };
}
