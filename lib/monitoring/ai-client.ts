import "server-only";

import { withRetry, isNetworkError } from "@/lib/trust/retry";
import { fetchWithTimeout, RequestTimeoutError } from "@/lib/monitoring/request-timeout";
import { captureException } from "@/lib/monitoring/sentry";
import { PROTECTION } from "@/lib/protection/config";

export type AiFetchOptions = {
  timeoutMs?: number;
  attempts?: number;
  delayMs?: number;
  /** Sentry category tag */
  category?: string;
};

const DEFAULT_AI_TIMEOUT_MS = PROTECTION.aiTimeoutMs;

function isRetryableAiError(error: unknown): boolean {
  if (error instanceof RequestTimeoutError) return true;
  if (isNetworkError(error)) return true;
  if (error instanceof Error) {
    const m = error.message;
    if (/429|503|502|504|rate limit/i.test(m)) return true;
  }
  return false;
}

/**
 * OpenAI-compatible chat completions fetch with timeout + retry.
 * Used for DeepSeek (project AI provider).
 */
export async function fetchAiCompletion(
  url: string,
  init: RequestInit,
  options: AiFetchOptions = {},
): Promise<Response> {
  const {
    timeoutMs = DEFAULT_AI_TIMEOUT_MS,
    attempts = PROTECTION.aiMaxRetries + 1,
    delayMs = 1000,
    category = "ai_api",
  } = options;

  try {
    return await withRetry(
      () =>
        fetchWithTimeout(url, {
          ...init,
          timeoutMs,
        }),
      {
        attempts,
        delayMs,
        shouldRetry: isRetryableAiError,
      },
    );
  } catch (error) {
    captureException(error, {
      category,
      extra: {
        endpoint: url,
        timeout_ms: timeoutMs,
        attempts,
      },
    });
    throw error;
  }
}
