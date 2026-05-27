/**
 * Sentry-ready hooks. Set SENTRY_DSN to enable server SDK integration later.
 */

export function isSentryEnabled(): boolean {
  return Boolean(process.env.SENTRY_DSN?.trim());
}

export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (!isSentryEnabled()) return;
  // Placeholder: import * as Sentry from '@sentry/nextjs' when package is added
  console.error("[sentry:stub]", error, context);
}
