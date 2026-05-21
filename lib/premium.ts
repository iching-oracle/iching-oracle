import {
  DEFAULT_LANGUAGE,
  normalizeLanguageCode,
  type SupportedLanguageCode,
} from "@/lib/i18n/languages";
import {
  isPremiumUser,
  type SubscriptionUserRecord,
} from "@/lib/subscription";

export type PremiumUserFields = {
  premiumUntil: Date | null;
};

const PREMIUM_PREVIEW_MARKERS = [
  "# Premium Interpretation Preview",
  "# Premium-Interpretation (Vorschau)",
  "# 高级解读预览",
] as const;

const FREE_INTERPRETATION_PLACEHOLDERS: Record<SupportedLanguageCode, string> = {
  de: `
# Premium-Interpretation (Vorschau)

Ihr Hexagramm wurde erfolgreich erzeugt.

Mit Premium erhalten Sie:
- Ausführliche KI-Interpretation
- Analyse der wandelnden Linien
- Praktische Lebenshinweise
- Ein Jahr unbegrenzter Premium-Nutzung
  `.trim(),
  en: `
# Premium Interpretation Preview

Your hexagram has been generated successfully.

Upgrade to Premium to unlock:
- Detailed AI-powered interpretation
- Changing lines analysis
- Practical life guidance
- One year of unlimited premium access
  `.trim(),
  "zh-CN": `
# 高级解读预览

您的卦象已成功生成。

升级 Premium 即可解锁：
- 详细的 AI 深度解读
- 动爻分析
- 实用的生活指引
- 一年无限次 Premium 使用权
  `.trim(),
};

export const PREMIUM_INTERPRETATION_PREVIEW =
  FREE_INTERPRETATION_PLACEHOLDERS.en;

export function hasPremiumAccess(
  userOrPremiumUntil:
    | PremiumUserFields
    | (PremiumUserFields & {
        subscriptionStatus?: string | null;
        subscriptionCurrentPeriodEnd?: Date | null;
      })
    | Date
    | null
    | undefined,
): boolean {
  if (
    userOrPremiumUntil &&
    typeof userOrPremiumUntil === "object" &&
    !(userOrPremiumUntil instanceof Date) &&
    ("subscriptionStatus" in userOrPremiumUntil ||
      "subscriptionCurrentPeriodEnd" in userOrPremiumUntil)
  ) {
    return isPremiumUser(userOrPremiumUntil as SubscriptionUserRecord);
  }

  const premiumUntil = resolvePremiumUntil(userOrPremiumUntil);
  if (!premiumUntil) return false;
  return premiumUntil > new Date();
}

function resolvePremiumUntil(
  userOrPremiumUntil: PremiumUserFields | Date | null | undefined,
): Date | null | undefined {
  if (userOrPremiumUntil instanceof Date) {
    return userOrPremiumUntil;
  }
  if (
    userOrPremiumUntil &&
    typeof userOrPremiumUntil === "object" &&
    "premiumUntil" in userOrPremiumUntil
  ) {
    return userOrPremiumUntil.premiumUntil;
  }
  return null;
}

/** Placeholder saved for free users — no AI tokens consumed. */
export function getFreeInterpretationPlaceholder(
  language?: string | null,
): string {
  const code = normalizeLanguageCode(language ?? DEFAULT_LANGUAGE);
  return FREE_INTERPRETATION_PLACEHOLDERS[code];
}

export function isPremiumInterpretationPreview(text: string): boolean {
  const trimmed = text.trim();
  return PREMIUM_PREVIEW_MARKERS.some((marker) => trimmed.startsWith(marker));
}

/** Short preview for legacy readings that contain a full AI interpretation. */
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
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(date);
}
