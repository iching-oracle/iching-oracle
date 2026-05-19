import {
  getHexagram,
  getRandomHexagramNumber,
} from "@/lib/hexagrams";
import { generateInterpretation } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

function buildFallbackInterpretation(
  hexagram: ReturnType<typeof getHexagram>,
): string {
  return `
第 ${hexagram.number} 卦 ${hexagram.chineseName} · ${hexagram.title}

${hexagram.judgment}

此卦提示你目前正處於重要的轉折點。請保持耐心，順應時機，並相信事情將朝著對你有利的方向發展。
`.trim();
}

/** Persist a new reading: random hexagram, AI interpretation, then return record. */
export async function saveReadingForUser(userId: string, question: string) {
  const trimmed = question.trim();
  const hexagramNumber = getRandomHexagramNumber();
  const hexagram = getHexagram(hexagramNumber);

  const hexagramTitle = `${hexagram.chineseName} · ${hexagram.title}`;

  let interpretation: string;

  try {
    interpretation = await generateInterpretation(trimmed, {
      number: hexagram.number,
      title: hexagramTitle,
      judgment: hexagram.judgment,
    });
  } catch (error) {
    console.error("OpenAI generation failed:", error);
    interpretation = buildFallbackInterpretation(hexagram);
  }

  return prisma.reading.create({
    data: {
      userId,
      question: trimmed,
      hexagram: hexagramNumber,
      changing: null,
      interpretation,
    },
  });
}
