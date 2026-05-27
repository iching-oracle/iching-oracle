import {
  DEFAULT_LANGUAGE,
  localeForLanguage,
  normalizeLanguageCode,
  type SupportedLanguageCode,
} from "@/lib/i18n/languages";

/** Normalize serialized dates from RSC → client props. */
export function coerceDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

/**
 * Stable date formatting for SSR + hydration (fixed locale + UTC).
 * Avoids bare toLocaleString() which differs between Node and the browser.
 */
export function formatDate(date: Date | string, locale = "de-DE"): string {
  const d = coerceDate(date);
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatDateTime(date: Date | string, locale = "de-DE"): string {
  const d = coerceDate(date);
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(d);
}

export function formatWeekdayDate(
  date: Date | string,
  locale = "en-US",
): string {
  const d = coerceDate(date);
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatDateForLanguage(
  date: Date | string,
  language: string | null | undefined,
): string {
  return formatDate(date, localeForLanguage(resolveLanguage(language)));
}

export function formatDateTimeForLanguage(
  date: Date | string,
  language: string | null | undefined,
): string {
  return formatDateTime(date, localeForLanguage(resolveLanguage(language)));
}

function resolveLanguage(
  language: string | null | undefined,
): SupportedLanguageCode {
  return normalizeLanguageCode(language ?? DEFAULT_LANGUAGE);
}
