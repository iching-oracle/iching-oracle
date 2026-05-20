import { PricingCard } from "@/components/PricingCard";
import {
  getInterpretationPreview,
  hasPremiumAccess,
  type PremiumUserFields,
} from "@/lib/premium";

type PremiumInterpretationProps = {
  user: PremiumUserFields;
  interpretation: string;
  readingId: string;
  isLegacyReading?: boolean;
};

export function PremiumInterpretation({
  user,
  interpretation,
  readingId,
  isLegacyReading = false,
}: PremiumInterpretationProps) {
  const isPremium = hasPremiumAccess(user);

  if (isPremium) {
    return (
      <div className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
        {interpretation}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-6">
      {isLegacyReading ? (
        <p className="rounded-lg border border-amber-gold/30 bg-amber-gold/10 px-3 py-2 text-sm text-amber-glow">
          This reading was saved before AI interpretation was enabled. Unlock
          premium to consult again with full Traditional Chinese guidance.
        </p>
      ) : (
        <div className="relative">
          <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
            {getInterpretationPreview(interpretation)}
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zen-surface to-transparent"
            aria-hidden
          />
        </div>
      )}
      <p className="text-sm text-zen-muted">
        Unlock the complete oracle interpretation — including 動爻, 變卦, and
        personalized guidance for your question.
      </p>
      <PricingCard hexagramId={readingId} compact />
    </div>
  );
}
