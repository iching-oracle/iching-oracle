/** Organic, timeless atmosphere — no SaaS grid. Performance-friendly CSS only. */
export function LandingAmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Warm base wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0e12] via-zen-bg to-[#08090c]" />

      {/* Paper grain */}
      <div className="landing-paper-grain absolute inset-0" />

      {/* Ink diffusion — slow drift */}
      <div className="absolute -left-1/4 top-[-10%] h-[min(90vw,640px)] w-[min(90vw,640px)] rounded-full bg-amber-gold/[0.05] blur-[140px] animate-fog-drift" />
      <div className="absolute -right-1/4 top-[20%] h-[min(70vw,480px)] w-[min(70vw,480px)] rounded-full bg-cosmic-purple/[0.06] blur-[120px] animate-fog-drift-reverse [animation-delay:2s]" />
      <div className="absolute bottom-[-15%] left-1/2 h-[min(80vw,520px)] w-[min(95vw,720px)] -translate-x-1/2 rounded-full bg-amber-gold/[0.04] blur-[100px] animate-breathe-glow" />

      {/* Tao-inspired geometry — single restrained ring */}
      <div className="landing-sacred-ring absolute left-1/2 top-[18%] -translate-x-1/2 sm:top-[14%]" />

      {/* Ambient dust — static positions, gentle float */}
      <span className="landing-particle left-[12%] top-[22%] [animation-delay:0s]" />
      <span className="landing-particle left-[78%] top-[28%] [animation-delay:2.5s]" />
      <span className="landing-particle left-[65%] top-[62%] [animation-delay:4s]" />
      <span className="landing-particle left-[22%] top-[70%] [animation-delay:1.2s]" />

      {/* Soft vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_0%,rgba(11,12,16,0.55)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-gold/15 to-transparent" />
    </div>
  );
}
