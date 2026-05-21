export type ChatMessageRole = "user" | "assistant";

export type ChatMessageDTO = {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
};

export type OracleChatContext = {
  question: string;
  language: string;
  primaryHexagram: {
    number: number;
    title: string;
    chineseName: string;
    judgment: string;
  };
  transformedHexagram: {
    number: number;
    title: string;
    chineseName: string;
  } | null;
  changingLinesSummary: string;
  interpretationExcerpt: string;
};

export type FollowUpChatState = {
  messages: ChatMessageDTO[];
  userMessageCount: number;
  messageLimit: number | null;
  canSend: boolean;
  isPremium: boolean;
};

export const FOLLOWUP_ERROR_CODES = {
  MESSAGE_LIMIT: "FOLLOWUP_MESSAGE_LIMIT",
  RATE_LIMIT: "FOLLOWUP_RATE_LIMIT",
} as const;
