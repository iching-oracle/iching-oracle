/** Keys stripped from Sentry extras and log metadata. */
const SENSITIVE_KEY_PATTERN =
  /password|secret|token|authorization|cookie|email|question|interpretation|message|content|api[_-]?key/i;

const SENSITIVE_VALUE_PATTERN =
  /^(sk_|pk_|whsec_|re_|phc_|phx_|Bearer\s)/i;

export function sanitizeMonitoringContext(
  context?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!context) return undefined;

  const safe: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(context)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) continue;
    if (typeof value === "string" && SENSITIVE_VALUE_PATTERN.test(value)) {
      safe[key] = "[redacted]";
      continue;
    }
    if (value === null || value === undefined) continue;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      safe[key] = typeof value === "string" ? value.slice(0, 500) : value;
    }
  }

  return Object.keys(safe).length > 0 ? safe : undefined;
}
