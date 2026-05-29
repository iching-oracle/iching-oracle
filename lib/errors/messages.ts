/** User-facing copy — never expose stack traces or internal codes in UI. */

export const USER_MESSAGES = {
  generic: "Something went still. Please try again in a moment.",
  oracleClouded:
    "The oracle is temporarily clouded. Please try again in a moment.",
  readingFailed:
    "Unable to complete your reading right now. Your credits were not used.",
  readingFailedCharged:
    "Unable to complete your reading right now. If credits were deducted, contact support.",
  aiUnavailable:
    "The oracle could not speak clearly. Please try again shortly.",
  authRequired: "Please sign in to continue.",
  sessionExpired: "Your session has expired. Please sign in again.",
  rateLimited:
    "You've reached today's guidance limit. Return tomorrow or upgrade for more.",
  rateLimitedShort: "Too many requests. Please pause and try again shortly.",
  paymentFailed:
    "Payment could not be completed. Please check your card or try again.",
  checkoutFailed: "Unable to start checkout. Please try again in a moment.",
  network: "Connection interrupted. Check your network and try again.",
  notFound: "This path leads nowhere. The page may have moved.",
  supportFailed: "Could not send your message. Please try again or email us.",
} as const;

export type UserMessageKey = keyof typeof USER_MESSAGES;

export function userMessage(
  key: UserMessageKey,
  fallback?: string,
): string {
  return USER_MESSAGES[key] ?? fallback ?? USER_MESSAGES.generic;
}
