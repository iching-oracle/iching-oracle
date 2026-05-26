const CAST_KEYWORDS =
  /\b(oracle|hexagram|i ching|iching|divination|cast|reading|consult|卦|占卜|起卦)\b/i;

const AFFIRMATIVE =
  /^(yes|yeah|yep|sure|please|ok|okay|do it|go ahead|consult|proceed)/i;

export function userRequestsCastExplicitly(message: string): boolean {
  return CAST_KEYWORDS.test(message) || AFFIRMATIVE.test(message.trim());
}

export function shouldSuggestOracleCast(params: {
  userMessageCount: number;
  hasReading: boolean;
  lastUserMessage?: string;
}): boolean {
  if (params.hasReading) return false;
  if (params.userMessageCount < 3) return false;
  if (params.lastUserMessage && userRequestsCastExplicitly(params.lastUserMessage)) {
    return true;
  }
  return params.userMessageCount >= 4;
}
