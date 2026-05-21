"use client";

export function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-amber-gold/40 animate-float-particle"
          style={{
            left: `${(i * 17 + 11) % 100}%`,
            top: `${(i * 23 + 7) % 100}%`,
            animationDelay: `${(i % 6) * 0.7}s`,
            animationDuration: `${4 + (i % 4)}s`,
          }}
        />
      ))}
    </div>
  );
}
