import "server-only";

import { getHexagram } from "@/lib/hexagrams";
import {
  getChangingLines,
  parseChangingLines,
  parseLineValues,
} from "@/lib/iching";
import { normalizeLanguageCode } from "@/lib/i18n/languages";
import { getChangingLineContexts } from "@/lib/interpretation/line-meanings";
import { isInterpretationMode } from "@/lib/interpretation/modes";
import type { OracleReadingContext } from "@/types/interpretation";
import { hexagramRecordToOracle } from "@/types/interpretation";
import type { Reading } from "@prisma/client";

function inferEmotionalContext(question: string): string {
  const q = question.toLowerCase();
  const signals: string[] = [];

  if (/love|relationship|partner|marriage|heart/i.test(q)) {
    signals.push("relational longing or partnership dynamics");
  }
  if (/career|job|work|business|money|finance/i.test(q)) {
    signals.push("vocational direction or material security");
  }
  if (/health|body|illness|healing/i.test(q)) {
    signals.push("embodied wellbeing and vitality");
  }
  if (/fear|anxiety|worry|stress|uncertain/i.test(q)) {
    signals.push("apprehension seeking reassurance");
  }
  if (/decision|choose|should i|what if/i.test(q)) {
    signals.push("decision tension at a crossroads");
  }
  if (/future|when|timing|will/i.test(q)) {
    signals.push("future-oriented seeking and temporal anxiety");
  }

  if (signals.length === 0) {
    return "The seeker brings an open question — read emotional tone from the hexagram movement itself.";
  }

  return `Emotional undertones detected: ${signals.join("; ")}.`;
}

export function buildOracleContextFromCast(params: {
  question: string;
  language: string;
  mode?: string;
  hexagramNumber: number;
  transformedHexagramNumber: number | null;
  lineValues: number[];
  changingPositions: number[];
}): OracleReadingContext {
  const language = normalizeLanguageCode(params.language);
  const interpretationMode = isInterpretationMode(params.mode ?? "traditional")
    ? params.mode!
    : "traditional";
  const primary = getHexagram(params.hexagramNumber);
  const transformed = params.transformedHexagramNumber
    ? getHexagram(params.transformedHexagramNumber)
    : null;

  return {
    question: params.question,
    language,
    mode: interpretationMode as OracleReadingContext["mode"],
    emotionalContext: inferEmotionalContext(params.question),
    primaryHexagram: hexagramRecordToOracle(primary),
    transformedHexagram: transformed
      ? hexagramRecordToOracle(transformed)
      : null,
    changingLines: getChangingLineContexts(
      primary,
      params.lineValues,
      params.changingPositions,
      language,
    ),
    lineValues: params.lineValues,
  };
}

export function buildOracleContextFromReading(
  reading: Reading,
  mode: string,
): OracleReadingContext {
  const language = normalizeLanguageCode(reading.language);
  const interpretationMode = isInterpretationMode(mode) ? mode : "traditional";
  const lineValues = parseLineValues(reading.lineValues);
  const changingPositions =
    parseChangingLines(reading.changingLines).length > 0
      ? parseChangingLines(reading.changingLines)
      : getChangingLines(lineValues);

  const primary = getHexagram(reading.hexagram);
  const transformed = reading.transformedHexagram
    ? getHexagram(reading.transformedHexagram)
    : null;

  return {
    question: reading.question,
    language,
    mode: interpretationMode,
    emotionalContext: inferEmotionalContext(reading.question),
    primaryHexagram: hexagramRecordToOracle(primary),
    transformedHexagram: transformed
      ? hexagramRecordToOracle(transformed)
      : null,
    changingLines: getChangingLineContexts(
      primary,
      lineValues,
      changingPositions,
      language,
    ),
    lineValues,
  };
}
