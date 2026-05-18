export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute -left-32 top-0 h-[480px] w-[480px] rounded-full bg-amber-gold/[0.07] blur-[100px] animate-pulse-glow" />
      <div className="absolute -right-24 bottom-1/4 h-[400px] w-[400px] rounded-full bg-amber-gold/[0.04] blur-[90px] animate-pulse-glow [animation-delay:2s]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(197,160,89,0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(197,160,89,0.4) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}
