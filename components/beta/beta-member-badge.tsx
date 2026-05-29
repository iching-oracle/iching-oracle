type BetaMemberBadgeProps = {
  className?: string;
};

export function BetaMemberBadge({ className = "" }: BetaMemberBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-cosmic-violet/35 bg-cosmic-purple/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-cosmic-violet ${className}`}
    >
      <span aria-hidden className="text-amber-gold">
        ✦
      </span>
      Early explorer
    </span>
  );
}
