type PremiumBadgeProps = {
  className?: string;
};

export function PremiumBadge({ className = "" }: PremiumBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-amber-gold/40 bg-amber-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-glow ${className}`}
    >
      <span aria-hidden>✦</span>
      Premium
    </span>
  );
}
