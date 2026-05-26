import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createOracleConversation,
  getOracleChatState,
} from "@/lib/oracle-chat/conversation";
import { prisma } from "@/lib/prisma";

/** Start a fresh oracle conversation (archives prior active session). */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.oracleConversation.updateMany({
    where: { userId: session.user.id, status: "active" },
    data: { status: "archived" },
  });

  const conversation = await createOracleConversation(session.user.id);
  const state = await getOracleChatState(session.user.id, conversation.id);

  return NextResponse.json(state);
}
