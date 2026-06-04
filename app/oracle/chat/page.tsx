import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { resolveValidUserId } from "@/lib/auth/session-user";
import { OracleChat } from "@/components/oracle/oracle-chat";
import {
  getEmptyOracleChatState,
  getOrCreateActiveConversation,
  getOracleChatState,
} from "@/lib/oracle-chat/conversation";

export const metadata = {
  title: "Conversation Oracle | IChing Oracle",
  description:
    "Reflect, converse, and consult the I Ching with a calm spiritual companion.",
};

export default async function OracleChatPage() {
  const session = await auth();

  const userId = await resolveValidUserId(session?.user?.id);
  if (!userId) {
    redirect("/login?callbackUrl=/oracle/chat");
  }

  const active = await getOrCreateActiveConversation(userId);
  const state =
    active.messages.length > 0
      ? (await getOracleChatState(userId, active.id)) ??
        (await getEmptyOracleChatState(userId, active.id))
      : await getEmptyOracleChatState(userId, active.id);

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] bg-zen-bg">
      <OracleChat initialState={state} />
    </div>
  );
}
