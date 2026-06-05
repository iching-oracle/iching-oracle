import type { ReactNode } from "react";

type HexagramNameProps = {
  children: ReactNode;
  /** sm = accent line; md = reading hero; lg = cast reveal */
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASS = {
  sm: "text-sm tracking-[0.14em]",
  md: "text-xl sm:text-2xl tracking-[0.1em]",
  lg: "text-4xl sm:text-5xl tracking-[0.08em]",
} as const;

/**
 * Chinese hexagram names only — Noto Serif SC, ceremonial spacing.
 * Use for 乾, 坤, etc. Never for UI labels or body copy.
 */
export function HexagramName({
  children,
  size = "md",
  className = "",
}: HexagramNameProps) {
  return (
    <span
      className={`font-hexagram text-amber-gold/90 ${SIZE_CLASS[size]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
