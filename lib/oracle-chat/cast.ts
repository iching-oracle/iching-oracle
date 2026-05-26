import "server-only";

import {
  castLines,
  getChangingLines,
  getPrimaryHexagram,
  getTransformedHexagram,
  serializeChangingLines,
  serializeLineValues,
} from "@/lib/iching";
import { getHexagram } from "@/lib/hexagrams";
import { buildOracleContextFromCast } from "@/lib/interpretation/context";
import { generateAdvancedInterpretation } from "@/lib/interpretation/generate";
import {
  parseInterpretationSections,
  serializeInterpretation,
} from "@/lib/interpretation/parse";
import { invalidatePatternInsightCache } from "@/lib/insights/invalidate";
import { scheduleMemoryExtraction } from "@/lib/memory/schedule";
import { normalizeLanguageCode } from "@/lib/i18n/languages";
import { detectReadingCategory } from "@/lib/readings/category";
import { extractReadingSummary } from "@/lib/readings/summary";
import {
  addOracleMessage,
  getOracleConversationForUser,
} from "@/lib/oracle-chat/conversation";
import {
  buildConversationSummary,
  distillQuestionFromMessages,
} from "@/lib/oracle-chat/summary";
import { INTERPRETATION_UNAVAILABLE_MESSAGE } from "@/lib/openai";
import {
  getFreeInterpretationPlaceholder,
  hasPremiumAccess,
} from "@/lib/premium";
import { assertCanCreateReading } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import { truncate } from "@/lib/truncate";
import type { OracleReadingMessageMeta } from "@/types/oracle-chat";
import { ORACLE_CHAT_ERROR_CODES } from "@/types/oracle-chat";

export async function castOracleReadingForConversation(
  userId: string,
  conversationId: string,
): Promise<
  | { ok: true; readingId: string; meta: OracleReadingMessageMeta }
  | { ok: false; code: string; message: string }
> {
  const conversation = await getOracleConversationForUser(
    userId,
    conversationId,
  );

  if (!conversation) {
    return { ok: false, code: "NOT_FOUND", message: "Conversation not found." };
  }

  if (conversation.readingId) {
    return {
      ok: false,
      code: "ALREADY_CAST",
      message: "This conversation already has an oracle reading.",
    };
  }

  const canCreate = await assertCanCreateReading(userId);
  if (!canCreate.ok) {
    return {
      ok: false,
      code: ORACLE_CHAT_ERROR_CODES.CAST_LIMIT,
      message: canCreate.message,
    };
  }

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
    return { ok: false, code: "NOT_FOUND", message: "User not found." };
  }

  const language = normalizeLanguageCode(user.preferredLanguage);
  const isPremium = hasPremiumAccess(user);
  const question = distillQuestionFromMessages(conversation.messages);
  const conversationSummary = buildConversationSummary(conversation.messages);

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
          question,
          language,
          mode: "psychological",
          hexagramNumber,
          transformedHexagramNumber,
          lineValues,
          changingPositions: changingLinePositions,
        });
        context.emotionalContext = `${context.emotionalContext}\n\nConversation context:\n${conversationSummary}`;

        const { raw } = await generateAdvancedInterpretation(context);
        const parsed = parseInterpretationSections(raw, context.mode);
        interpretation = serializeInterpretation(parsed);
        interpretationPending = false;
        isPremiumReading = true;
      } catch (error) {
        console.error("[oracle-chat] cast interpretation failed", error);
        interpretation = INTERPRETATION_UNAVAILABLE_MESSAGE;
        interpretationPending = true;
      }
    }
  } else {
    interpretation = getFreeInterpretationPlaceholder(language);
    interpretationPending = false;
    isPremiumReading = false;
  }

  const category = detectReadingCategory(question);
  const summary = extractReadingSummary(interpretation);

  const reading = await prisma.reading.create({
    data: {
      userId,
      question,
      hexagram: hexagramNumber,
      primaryHexagramName: primary.title,
      lineValues: serializeLineValues(lineValues),
      changingLines: serializeChangingLines(changingLinePositions),
      transformedHexagram: transformedHexagramNumber,
      finalHexagramName: transformed?.title ?? null,
      interpretation,
      interpretationPending,
      isPremiumReading,
      interpretationMode: "psychological",
      summary,
      category,
      language,
    },
  });

  await prisma.oracleConversation.update({
    where: { id: conversationId },
    data: {
      readingId: reading.id,
      status: "completed",
      title: question.slice(0, 120),
    },
  });

  const excerpt = truncate(
    summary || interpretation.replace(/^#+\s+/m, "").trim(),
    400,
  );

  const meta: OracleReadingMessageMeta = {
    readingId: reading.id,
    hexagram: hexagramNumber,
    primaryTitle: primary.title,
    chineseName: primary.chineseName,
    transformedHexagram: transformedHexagramNumber,
    transformedTitle: transformed?.title ?? null,
    interpretationExcerpt: excerpt,
  };

  await addOracleMessage(
    conversationId,
    "oracle_reading",
    `The oracle has spoken — ${primary.number}. ${primary.title}`,
    meta,
  );

  void invalidatePatternInsightCache(userId);
  scheduleMemoryExtraction(userId, "oracle_chat", conversationId);

  return { ok: true, readingId: reading.id, meta };
}
