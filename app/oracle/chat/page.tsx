import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { resolveValidUserId } from "@/lib/auth/session-user";
import { OracleChat } from "@/components/oracle/oracle-chat";
import {
  getEmptyOracleChatState,
  getOrCreateActiveConversation,
  getOracleChatState,
} from "@/lib/oracle-chat/conversation";

import { buildNoIndexMetadata } from "@/lib/seo/noindex-metadata";

export const metadata = buildNoIndexMetadata({
  title: "Conversation oracle",
  description:
    "Reflect, converse, and consult the I Ching with a calm spiritual companion.",
  path: "/oracle/chat",
});

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
    <div className="relative bg-zen-bg max-md:min-h-0 max-md:flex-1">
      <OracleChat initialState={state} />
    </div>
  );
}
