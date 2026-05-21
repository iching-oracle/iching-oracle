import "server-only";

import { parseChangingLines, parseLineValues } from "@/lib/iching";
import { buildOracleContextFromReading } from "@/lib/interpretation/context";
import { generateAdvancedInterpretation } from "@/lib/interpretation/generate";
import {
  parseInterpretationSections,
  serializeInterpretation,
} from "@/lib/interpretation/parse";
import { extractReadingSummary } from "@/lib/readings/summary";
import { hasPremiumAccess } from "@/lib/premium";
import { prisma } from "@/lib/prisma";

/** Regenerate AI interpretation for a pending or unlockable reading (premium only). */
export async function regenerateInterpretationForReading(
  userId: string,
  readingId: string,
  mode = "traditional",
): Promise<{ success: boolean; error?: string }> {
  const [reading, user] = await Promise.all([
    prisma.reading.findFirst({
      where: { id: readingId, userId },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { premiumUntil: true },
    }),
  ]);

  if (!reading) {
    return { success: false, error: "Reading not found." };
  }

  if (!hasPremiumAccess(user)) {
    return {
      success: false,
      error: "Premium subscription required to generate AI interpretation.",
    };
  }

  const canRegenerate =
    reading.interpretationPending || !reading.isPremiumReading;

  if (!canRegenerate) {
    return {
      success: false,
      error: "This reading already has an interpretation.",
    };
  }

  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    return { success: false, error: "AI service is not configured." };
  }

  try {
    const context = buildOracleContextFromReading(reading, mode);
    const { raw } = await generateAdvancedInterpretation(context);
    const parsed = parseInterpretationSections(raw, context.mode);
    const interpretation = serializeInterpretation(parsed);

    await prisma.reading.update({
      where: { id: readingId },
      data: {
        interpretation,
        interpretationPending: false,
        isPremiumReading: true,
        interpretationMode: mode,
        summary: extractReadingSummary(interpretation),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[regenerate-interpretation]", error);
    return {
      success: false,
      error: "AI interpretation is still unavailable. Please try again later.",
    };
  }
}
