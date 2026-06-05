import type { ReactNode } from "react";

type PriceAmountProps = {
  /** Full price string e.g. "€9.99" or "€0", or pass children for custom */
  value?: string;
  children?: ReactNode;
  variant?: "default" | "gold";
  suffix?: string;
  className?: string;
};

function splitPrice(display: string): { symbol: string; numerals: string } | null {
  const match = display.trim().match(/^([€$£])([\d.,]+)$/);
  if (!match) return null;
  return { symbol: match[1]!, numerals: match[2]! };
}

/**
 * Editorial pricing — Cormorant Garamond, light weight, refined currency scale.
 */
export function PriceAmount({
  value,
  children,
  variant = "default",
  suffix,
  className = "",
}: PriceAmountProps) {
  const color =
    variant === "gold" ? "text-amber-gold" : "text-foreground";

  const parsed = value ? splitPrice(value) : null;

  return (
    <p className={`pricing-card__price ${className}`.trim()}>
      <span className={`price-amount inline-flex items-baseline font-display font-light ${color}`}>
        {parsed ? (
          <>
            <span className="price-currency" aria-hidden>
              {parsed.symbol}
            </span>
            <span className="price-numeral tabular-nums">{parsed.numerals}</span>
          </>
        ) : (
          <span className="price-numeral tabular-nums">{children ?? value}</span>
        )}
      </span>
      {suffix ? (
        <span className="price-amount-suffix ml-2 align-baseline">{suffix}</span>
      ) : null}
    </p>
  );
}
