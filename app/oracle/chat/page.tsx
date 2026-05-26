import { redirect } from "next/navigation";
import { auth } from "@/auth";
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

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/oracle/chat");
  }

  const active = await getOrCreateActiveConversation(session.user.id);
  const state =
    active.messages.length > 0
      ? (await getOracleChatState(session.user.id, active.id)) ??
        (await getEmptyOracleChatState(session.user.id, active.id))
      : await getEmptyOracleChatState(session.user.id, active.id);

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] bg-zen-bg">
      <OracleChat initialState={state} />
    </div>
  );
}
