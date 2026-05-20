import {
  castLines,
  getChangingLines,
  getPrimaryHexagram,
  getTransformedHexagram,
  serializeChangingLines,
  serializeLineValues,
} from "@/lib/iching";
import { getHexagram } from "@/lib/hexagrams";
import { generateInterpretation } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

function toHexagramTitle(hexagram: ReturnType<typeof getHexagram>): string {
  return `${hexagram.chineseName} · ${hexagram.title}`;
}

/** Cast coins, interpret, and persist a new reading. */
export async function saveReadingForUser(userId: string, question: string) {
  const trimmed = question.trim();
  const lineValues = castLines();
  const hexagramNumber = getPrimaryHexagram(lineValues);
  const changingLinePositions = getChangingLines(lineValues);
  const transformedHexagramNumber = getTransformedHexagram(lineValues);

  const primary = getHexagram(hexagramNumber);
  const transformed = transformedHexagramNumber
    ? getHexagram(transformedHexagramNumber)
    : null;

  const interpretation = await generateInterpretation({
    question: trimmed,
    primaryHexagram: {
      number: primary.number,
      title: toHexagramTitle(primary),
      judgment: primary.judgment,
    },
    transformedHexagram: transformed
      ? {
          number: transformed.number,
          title: toHexagramTitle(transformed),
          judgment: transformed.judgment,
        }
      : null,
    changingLines: changingLinePositions,
  });

  return prisma.reading.create({
    data: {
      userId,
      question: trimmed,
      hexagram: hexagramNumber,
      primaryHexagramName: primary.title,
      lineValues: serializeLineValues(lineValues),
      changingLines: serializeChangingLines(changingLinePositions),
      transformedHexagram: transformedHexagramNumber,
      finalHexagramName: transformed?.title ?? null,
      interpretation,
    },
  });
}
