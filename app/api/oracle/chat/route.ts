import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  addOracleMessage,
  createOracleConversation,
  getOracleChatState,
  getOracleConversationForUser,
} from "@/lib/oracle-chat/conversation";
import { assertCanSendOracleChat } from "@/lib/oracle-chat/limits";
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
import { ORACLE_CHAT_ERROR_CODES } from "@/types/oracle-chat";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const conversationId = url.searchParams.get("conversationId")?.trim();

  if (conversationId) {
    const state = await getOracleChatState(session.user.id, conversationId);
    if (!state) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
    return NextResponse.json(state);
  }

  const { getOrCreateActiveConversation } = await import(
    "@/lib/oracle-chat/conversation"
  );
  const conversation = await getOrCreateActiveConversation(session.user.id);
  const state = await getOracleChatState(session.user.id, conversation.id);
  if (!state) {
    return NextResponse.json({ error: "Could not load conversation" }, { status: 500 });
  }

  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    const created = await createOracleConversation(session.user.id);
    conversationId = created.id;
  }

  const conversation = await getOracleConversationForUser(
    session.user.id,
    conversationId!,
  );

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const canSend = await assertCanSendOracleChat(
    session.user.id,
    conversation.id,
  );
  if (!canSend.ok) {
    return NextResponse.json(
      { error: canSend.message, code: canSend.code },
      {
        status:
          canSend.code === ORACLE_CHAT_ERROR_CODES.RATE_LIMIT ? 429 : 403,
      },
    );
  }

  await addOracleMessage(conversation.id, "user", message);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferredLanguage: true },
  });
  const language = normalizeLanguageCode(user?.preferredLanguage);

  const history = [...conversation.messages, { role: "user", content: message }];

  try {
    const memories = await retrieveRelevantMemories(
      session.user.id,
      message,
      "oracle_chat",
      conversation.id,
    );
    const memoryBlock = formatMemoriesForPrompt(memories);

    const rawStream = await streamOracleConversationChat({
      userId: session.user.id,
      language,
      messages: history as typeof conversation.messages,
      reading: conversation.reading,
      newUserMessage: message,
      memoryBlock,
    });

    const stream = teeStreamForPersistence(rawStream, async (fullText) => {
      await addOracleMessage(conversation!.id, "assistant", fullText);
      scheduleMemoryExtraction(
        session.user.id,
        "oracle_chat",
        conversation.id,
      );
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
