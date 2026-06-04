import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolveValidUserId } from "@/lib/auth/session-user";
import { castOracleReadingForConversation } from "@/lib/oracle-chat/cast";
import { getOracleChatState } from "@/lib/oracle-chat/conversation";
import { oracleCastSchema } from "@/lib/validations/oracle-chat";
import { CREDIT_ERROR_CODES } from "@/types/credits";

export async function POST(request: Request) {
  const session = await auth();
  const userId = await resolveValidUserId(session?.user?.id);
  if (!userId) {
    return NextResponse.json(
      { error: "Session expired. Please sign in again." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = oracleCastSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }

  const result = await castOracleReadingForConversation(
    userId,
    parsed.data.conversationId,
  );

  if (!result.ok) {
    const status =
      result.code === CREDIT_ERROR_CODES.INSUFFICIENT ||
      result.code === CREDIT_ERROR_CODES.PREMIUM_REQUIRED
        ? 403
        : result.code === "NOT_FOUND"
          ? 404
          : 400;
    return NextResponse.json(
      { error: result.message, code: result.code },
      { status },
    );
  }

  const state = await getOracleChatState(userId, parsed.data.conversationId);

  return NextResponse.json({
    readingId: result.readingId,
    meta: result.meta,
    state,
  });
}
