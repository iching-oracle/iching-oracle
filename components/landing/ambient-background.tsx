export function LandingAmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-amber-gold/[0.06] blur-[120px] animate-pulse-glow" />
      <div className="absolute -right-32 top-1/3 h-[420px] w-[420px] rounded-full bg-cosmic-purple/[0.08] blur-[100px] animate-pulse-glow [animation-delay:1.5s]" />
      <div className="absolute bottom-0 left-1/2 h-[360px] w-[600px] -translate-x-1/2 rounded-full bg-amber-gold/[0.03] blur-[90px]" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(197,160,89,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(197,160,89,0.5) 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-gold/20 to-transparent" />
    </div>
  );
}
