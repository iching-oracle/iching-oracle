export type PremiumUserFields = {
  premiumUntil: Date | null;
};

export function hasPremiumAccess(
  user: PremiumUserFields | null | undefined,
): boolean {
  if (!user?.premiumUntil) return false;
  return user.premiumUntil > new Date();
}

/** Short preview for non-premium users (Traditional Chinese friendly). */
export function getInterpretationPreview(
  interpretation: string,
  maxChars = 280,
): string {
  const trimmed = interpretation.trim();
  if (trimmed.length <= maxChars) return trimmed;

  const sentenceEnd = trimmed.lastIndexOf("。", maxChars);
  const cut = sentenceEnd > 80 ? sentenceEnd + 1 : maxChars;
  return `${trimmed.slice(0, cut).trim()}……`;
}

export function formatPremiumExpiry(date: Date | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("zh-Hant", { dateStyle: "long" }).format(date);
}
