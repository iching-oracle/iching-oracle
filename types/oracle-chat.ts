export type OracleMessageRole =
  | "user"
  | "assistant"
  | "oracle_reading"
  | "reflection";

export type OracleReadingMessageMeta = {
  readingId: string;
  hexagram: number;
  primaryTitle: string;
  chineseName: string;
  transformedHexagram: number | null;
  transformedTitle: string | null;
  interpretationExcerpt: string;
};

export type OracleChatMessageDTO = {
  id: string;
  role: OracleMessageRole;
  content: string;
  createdAt: string;
  metadata?: OracleReadingMessageMeta | null;
};

export type OracleChatState = {
  conversationId: string;
  messages: OracleChatMessageDTO[];
  userMessageCount: number;
  messageLimit: number | null;
  canSend: boolean;
  isPremium: boolean;
  hasReading: boolean;
  readingId: string | null;
  suggestCast: boolean;
  canCast: boolean;
};

export const ORACLE_CHAT_ERROR_CODES = {
  MESSAGE_LIMIT: "ORACLE_CHAT_MESSAGE_LIMIT",
  RATE_LIMIT: "ORACLE_CHAT_RATE_LIMIT",
  CAST_LIMIT: "ORACLE_CAST_LIMIT",
} as const;
