import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildOracleChatContextFromReading } from "@/lib/chat/context";
import {
  addMessage,
  getOrCreateConversation,
  getFollowUpChatState,
  getReadingForChat,
} from "@/lib/chat/conversation";
import { assertCanSendFollowUp } from "@/lib/chat/limits";
import { streamFollowUpChat, teeStreamForPersistence } from "@/lib/chat/stream";
import {
  formatMemoriesForPrompt,
  retrieveRelevantMemories,
} from "@/lib/memory/retrieve";
import { scheduleMemoryExtraction } from "@/lib/memory/schedule";
import { followUpMessageSchema } from "@/lib/validations/chat";
import { FOLLOWUP_ERROR_CODES } from "@/types/chat";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const readingId = new URL(request.url).searchParams.get("readingId")?.trim();
  if (!readingId) {
    return NextResponse.json({ error: "readingId required" }, { status: 400 });
  }

  const reading = await getReadingForChat(session.user.id, readingId);
  if (!reading) {
    return NextResponse.json({ error: "Reading not found" }, { status: 404 });
  }

  const state = await getFollowUpChatState(session.user.id, readingId);
  if (!state) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  return NextResponse.json({
    messages: state.messages,
    userMessageCount: state.userMessageCount,
    messageLimit: state.messageLimit,
    canSend: state.canSend,
    isPremium: state.isPremium,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "Guidance is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = followUpMessageSchema.safeParse(body);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Invalid message";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { readingId, message } = parsed.data;
  if (!message) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  const reading = await getReadingForChat(session.user.id, readingId);
  if (!reading) {
    return NextResponse.json({ error: "Reading not found" }, { status: 404 });
  }

  const conversation = await getOrCreateConversation(
    session.user.id,
    readingId,
  );
  if (!conversation) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const canSend = await assertCanSendFollowUp(
    session.user.id,
    conversation.id,
  );
  if (!canSend.ok) {
    return NextResponse.json(
      { error: canSend.message, code: canSend.code },
      {
        status:
          canSend.code === FOLLOWUP_ERROR_CODES.RATE_LIMIT ? 429 : 403,
      },
    );
  }

  await addMessage(conversation.id, "user", message);

  const history = [
    ...conversation.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ];

  try {
    const context = buildOracleChatContextFromReading(reading);
    const memories = await retrieveRelevantMemories(
      session.user.id,
      `${reading.question} ${message}`,
      "reading_followup",
      readingId,
    );
    const memoryBlock = formatMemoriesForPrompt(memories);

    const rawStream = await streamFollowUpChat({
      context,
      history,
      memoryBlock,
    });

    const stream = teeStreamForPersistence(rawStream, async (fullText) => {
      await addMessage(conversation.id, "assistant", fullText);
      scheduleMemoryExtraction(session.user.id, "reading", readingId);
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Conversation-Id": conversation.id,
      },
    });
  } catch (error) {
    console.error("[api/chat/followup POST]", error);
    return NextResponse.json(
      {
        error:
          "The oracle could not respond just now. Take a breath and try again.",
      },
      { status: 500 },
    );
  }
}
