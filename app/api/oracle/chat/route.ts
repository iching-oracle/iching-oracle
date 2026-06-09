import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { guardAiRoute } from "@/lib/api/route-guard";
import { RATE_LIMITS } from "@/lib/rate-limit/presets";
import { resolveValidUserId } from "@/lib/auth/session-user";
import {
  addOracleMessage,
  createOracleConversation,
  getOracleChatState,
  getOracleConversationForUser,
} from "@/lib/oracle-chat/conversation";
import { chargeCreditsForFeature } from "@/lib/credits/assert";
import { CREDIT_ERROR_CODES } from "@/types/credits";
import {
  streamOracleConversationChat,
  teeStreamForPersistence,
} from "@/lib/oracle-chat/stream";
import { normalizeLanguageCode } from "@/lib/i18n/languages";
import {
  formatMemoriesForPrompt,
  retrieveRelevantMemories,
} from "@/lib/memory/retrieve";
import { scheduleMemoryExtraction } from "@/lib/memory/schedule";
import { oracleChatMessageSchema } from "@/lib/validations/oracle-chat";
import { prisma } from "@/lib/prisma";

async function getOracleChatUserId() {
  const session = await auth();
  const userId = await resolveValidUserId(session?.user?.id);
  return { session, userId };
}

export async function GET(request: Request) {
  const { userId } = await getOracleChatUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Session expired. Please sign in again." },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const conversationId = url.searchParams.get("conversationId")?.trim();

  if (conversationId) {
    const state = await getOracleChatState(userId, conversationId);
    if (!state) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
    return NextResponse.json(state);
  }

  const { getOrCreateActiveConversation } = await import(
    "@/lib/oracle-chat/conversation"
  );
  const conversation = await getOrCreateActiveConversation(userId);
  const state = await getOracleChatState(userId, conversation.id);
  if (!state) {
    return NextResponse.json({ error: "Could not load conversation" }, { status: 500 });
  }

  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const { session, userId } = await getOracleChatUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Session expired. Please sign in again." },
      { status: 401 },
    );
  }

  const guarded = await guardAiRoute({
    request,
    scope: "oracle-chat",
    userId,
    role: session?.user?.role,
    ai: true,
    ipPreset: RATE_LIMITS.oracleChat,
  });
  if (guarded) return guarded;

  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "The oracle is resting. Please try again later." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = oracleChatMessageSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid message";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { message } = parsed.data;
  let conversationId = parsed.data.conversationId;

  if (!conversationId) {
    const created = await createOracleConversation(userId);
    conversationId = created.id;
  }

  const conversation = await getOracleConversationForUser(
    userId,
    conversationId!,
  );

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const creditCharge = await chargeCreditsForFeature(userId, "oracle_chat");
  if (!creditCharge.ok) {
    return NextResponse.json(
      { error: creditCharge.message, code: creditCharge.code },
      {
        status:
          creditCharge.code === CREDIT_ERROR_CODES.RATE_LIMIT ? 429 : 403,
      },
    );
  }

  await addOracleMessage(conversation.id, "user", message);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferredLanguage: true },
  });
  const language = normalizeLanguageCode(user?.preferredLanguage);

  const history = [...conversation.messages, { role: "user", content: message }];

  try {
    const memories = await retrieveRelevantMemories(
      userId,
      message,
      "oracle_chat",
      conversation.id,
    );
    const memoryBlock = formatMemoriesForPrompt(memories);

    const rawStream = await streamOracleConversationChat({
      userId,
      language,
      messages: history as typeof conversation.messages,
      reading: conversation.reading,
      newUserMessage: message,
      memoryBlock,
    });

    const stream = teeStreamForPersistence(rawStream, async (fullText) => {
      await addOracleMessage(conversation!.id, "assistant", fullText);
      scheduleMemoryExtraction(userId, "oracle_chat", conversation.id);
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Conversation-Id": conversation.id,
      },
    });
  } catch (error) {
    console.error("[api/oracle/chat POST]", error);
    return NextResponse.json(
      {
        error:
          "The oracle could not respond just now. Take a breath and try again.",
      },
      { status: 500 },
    );
  }
}
