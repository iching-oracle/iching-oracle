type FeatureCardProps = {
  titleEn: string;
  accentZh?: string;
  description: string;
  icon: React.ReactNode;
};

export function FeatureCard({
  titleEn,
  accentZh,
  description,
  icon,
}: FeatureCardProps) {
  return (
    <article className="group relative flex flex-col gap-5 rounded-2xl border border-white/[0.06] bg-zen-surface/80 p-8 backdrop-blur-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:border-amber-gold/50 hover:shadow-[0_0_40px_-8px_rgba(197,160,89,0.45)]">
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-gold/[0.04] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-zen-elevated text-amber-gold transition-all duration-500 group-hover:border-amber-gold/60 group-hover:shadow-[0_0_24px_rgba(197,160,89,0.35)]">
        {icon}
      </div>
      <div className="relative z-10 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="type-display text-lg font-medium">{titleEn}</h3>
          {accentZh ? (
            <span
              className="font-hexagram text-base text-amber-gold/35"
              aria-hidden
            >
              {accentZh}
            </span>
          ) : null}
        </div>
        <p className="type-muted">{description}</p>
      </div>
    </article>
  );
}
