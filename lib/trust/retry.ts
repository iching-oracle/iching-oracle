export type RetryOptions = {
  attempts?: number;
  delayMs?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const attempts = options.attempts ?? 3;
  const delayMs = options.delayMs ?? 800;
  const shouldRetry = options.shouldRetry ?? (() => true);
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isLast = i >= attempts - 1;
      if (isLast || !shouldRetry(err, i + 1)) break;
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }

  throw lastError;
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  const msg = error instanceof Error ? error.message : String(error);
  return /network|fetch|timeout|aborted/i.test(msg);
}
