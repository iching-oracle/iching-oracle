import Link from "next/link";

export function Hero() {
  return (
    <section className="flex flex-col items-center py-16 text-center sm:py-24">
      <p className="mb-6 text-[10px] font-medium uppercase tracking-[0.35em] text-zen-muted">
        易經 · Book of Changes
      </p>

      <h1 className="mb-5 bg-gradient-to-b from-amber-glow via-amber-gold to-amber-gold/70 bg-clip-text text-4xl font-light tracking-[0.18em] text-transparent sm:text-5xl md:text-6xl">
        ICHING-ORACLE
      </h1>

      <p className="font-serif text-xl leading-relaxed text-foreground/95 sm:text-2xl md:text-3xl">
        觀天道以明人事，心誠則靈。
      </p>

      <p className="mt-5 max-w-lg text-sm leading-relaxed text-zen-muted">
        Ancient wisdom meets quiet digital ritual. Still your mind, choose a
        path, and let the hexagram speak.
      </p>

      <Link
        href="#methods"
        className="group relative mt-12 inline-flex items-center justify-center overflow-hidden rounded-full px-10 py-4 text-base font-medium tracking-wide text-zen-bg transition-transform duration-300 hover:scale-[1.04] active:scale-[0.98]"
      >
        <span
          className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-gold/90 via-amber-glow to-amber-gold/90 animate-shimmer shadow-[0_0_32px_rgba(197,160,89,0.45)] transition-shadow duration-500 group-hover:shadow-[0_0_56px_rgba(197,160,89,0.7)]"
          aria-hidden
        />
        <span
          className="absolute inset-px rounded-full bg-gradient-to-b from-amber-glow/95 to-amber-gold/90 opacity-90"
          aria-hidden
        />
        <span className="relative z-10">Get Started</span>
      </Link>
    </section>
  );
}
