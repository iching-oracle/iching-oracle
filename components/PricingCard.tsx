import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";

type PricingCardProps = {
  hexagramId?: string;
  compact?: boolean;
};

export function PricingCard({ hexagramId, compact = false }: PricingCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/15 bg-zen-surface/60 backdrop-blur-xl ${
        compact ? "p-5" : "p-8"
      } shadow-[0_0_60px_-20px_rgba(139,92,246,0.45)]`}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cosmic-purple/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-amber-gold/15 blur-3xl"
        aria-hidden
      />

      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-cosmic-violet">
          Premium Reading
        </p>
        <p className="mt-2 font-serif text-4xl font-light text-amber-gold">
          Premium
        </p>
        <p className="mt-1 text-sm text-zen-muted">Monthly subscription · cancel anytime</p>

        <ul className={`mt-6 space-y-2.5 text-sm text-foreground/90 ${compact ? "text-xs" : ""}`}>
          <li className="flex items-start gap-2">
            <span className="text-amber-gold">✦</span>
            Detailed AI interpretation in Traditional Chinese
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-gold">✦</span>
            Changing lines (動爻) analysis
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-gold">✦</span>
            Transformed hexagram (變卦) guidance
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-gold">✦</span>
            Life advice and spiritual insights
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-gold">✦</span>
            Unlimited readings & full journal
          </li>
        </ul>

        <div className="mt-8">
          <StripeCheckoutButton hexagramId={hexagramId} />
        </div>
      </div>
    </div>
  );
}
