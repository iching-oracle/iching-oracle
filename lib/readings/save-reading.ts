import {
  castLines,
  getChangingLines,
  getPrimaryHexagram,
  getTransformedHexagram,
  serializeChangingLines,
  serializeLineValues,
} from "@/lib/iching";
import { getHexagram } from "@/lib/hexagrams";
import { INTERPRETATION_UNAVAILABLE_MESSAGE } from "@/lib/openai";
import { buildOracleContextFromCast } from "@/lib/interpretation/context";
import { generateAdvancedInterpretation } from "@/lib/interpretation/generate";
import {
  parseInterpretationSections,
  serializeInterpretation,
} from "@/lib/interpretation/parse";
import {
  getFreeInterpretationPlaceholder,
  hasPremiumAccess,
} from "@/lib/premium";
import { chargeCreditsForFeature } from "@/lib/credits/assert";
import { refundCredits } from "@/lib/credits/balance";
import { normalizeLanguageCode } from "@/lib/i18n/languages";
import { detectReadingCategory } from "@/lib/readings/category";
import { extractReadingSummary } from "@/lib/readings/summary";
import { invalidatePatternInsightCache } from "@/lib/insights/invalidate";
import { scheduleMemoryExtraction } from "@/lib/memory/schedule";
import { prisma } from "@/lib/prisma";

/** Cast coins, interpret, and persist a new reading (always saves, even if AI fails). */
export async function saveReadingForUser(userId: string, question: string) {
  const trimmed = question.trim();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      premiumUntil: true,
      preferredLanguage: true,
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  const language = normalizeLanguageCode(user.preferredLanguage);
  const isPremium = hasPremiumAccess(user);

  const creditFeature = isPremium ? "deep_interpretation" : "basic_reading";
  const creditCharge = await chargeCreditsForFeature(userId, creditFeature);
  if (!creditCharge.ok) {
    throw new Error(creditCharge.message);
  }

  const creditCost = isPremium ? 3 : 1;

  console.log("[readings] Premium user:", isPremium);

  const lineValues = castLines();
  const hexagramNumber = getPrimaryHexagram(lineValues);
  const changingLinePositions = getChangingLines(lineValues);
  const transformedHexagramNumber = getTransformedHexagram(lineValues);

  const primary = getHexagram(hexagramNumber);
  const transformed = transformedHexagramNumber
    ? getHexagram(transformedHexagramNumber)
    : null;

  let interpretation: string;
  let interpretationPending = false;
  let isPremiumReading = false;

  if (isPremium) {
    if (!process.env.DEEPSEEK_API_KEY?.trim()) {
      interpretation = INTERPRETATION_UNAVAILABLE_MESSAGE;
      interpretationPending = true;
    } else {
      try {
        const context = buildOracleContextFromCast({
          question: trimmed,
          language,
          mode: "traditional",
          hexagramNumber,
          transformedHexagramNumber,
          lineValues,
          changingPositions: changingLinePositions,
        });
        const { raw } = await generateAdvancedInterpretation(context);
        const parsed = parseInterpretationSections(raw, context.mode);
        interpretation = serializeInterpretation(parsed);
        interpretationPending = false;
        isPremiumReading = true;
        console.log("[readings] Advanced AI interpretation generated.");
      } catch (error) {
        console.error("[readings] Advanced AI interpretation failed", error);
        interpretation = INTERPRETATION_UNAVAILABLE_MESSAGE;
        interpretationPending = true;
        await refundCredits(
          userId,
          creditCost,
          "Refund: interpretation generation failed",
        );
      }
    }
  } else {
    console.log("[readings] Skipping AI generation for non-premium user.");
    interpretation = getFreeInterpretationPlaceholder(language);
    interpretationPending = false;
    isPremiumReading = false;
  }

  const category = detectReadingCategory(trimmed);
  const summary = extractReadingSummary(interpretation);

  const reading = await prisma.reading.create({
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
      interpretationPending,
      isPremiumReading,
      interpretationMode: "traditional",
      summary,
      category,
      language,
    },
  });

  void invalidatePatternInsightCache(userId);
  scheduleMemoryExtraction(userId, "reading", reading.id);

  return reading;
}
