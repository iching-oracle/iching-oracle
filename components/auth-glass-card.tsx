import type { ReactNode } from "react";

type AuthGlassCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function AuthGlassCard({
  title,
  subtitle,
  children,
  className,
}: AuthGlassCardProps) {
  return (
    <div className={`relative w-full max-w-md ${className ?? ""}`}>
      <div
        className="absolute -inset-px rounded-2xl bg-gradient-to-br from-cosmic-purple/40 via-amber-gold/20 to-cosmic-violet/30 opacity-70 blur-sm"
        aria-hidden
      />
      <div className="relative rounded-2xl border border-white/10 bg-zen-surface/70 p-8 shadow-[0_0_60px_-20px_rgba(139,92,246,0.45)] backdrop-blur-xl sm:p-10">
        <div className="mb-8 text-center">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.35em] text-cosmic-violet">
            ICHING-ORACLE
          </p>
          <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm leading-relaxed text-zen-muted">
              {subtitle}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
