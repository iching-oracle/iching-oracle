import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolveValidUserId } from "@/lib/auth/session-user";
import {
  createOracleConversation,
  getOracleChatState,
} from "@/lib/oracle-chat/conversation";
import { prisma } from "@/lib/prisma";

/** Start a fresh oracle conversation (archives prior active session). */
export async function POST() {
  const session = await auth();
  const userId = await resolveValidUserId(session?.user?.id);
  if (!userId) {
    return NextResponse.json(
      { error: "Session expired. Please sign in again." },
      { status: 401 },
    );
  }

  await prisma.oracleConversation.updateMany({
    where: { userId, status: "active" },
    data: { status: "archived" },
  });

  const conversation = await createOracleConversation(userId);
  const state = await getOracleChatState(userId, conversation.id);

  return NextResponse.json(state);
}
