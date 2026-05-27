import {
  TRUST_ENCRYPTION,
  TRUST_PAYMENT,
  TRUST_PRIVACY,
} from "@/lib/trust/messages";

export function TrustBadges({ className = "" }: { className?: string }) {
  const items = [TRUST_PAYMENT, TRUST_PRIVACY, TRUST_ENCRYPTION];

  return (
    <ul
      className={`grid gap-3 sm:grid-cols-3 ${className}`}
      aria-label="Trust and security"
    >
      {items.map((text) => (
        <li
          key={text}
          className="rounded-xl border border-white/10 bg-zen-surface/40 px-4 py-3 text-xs leading-relaxed text-zen-muted"
        >
          <span className="mr-1.5 text-amber-gold" aria-hidden>
            ✦
          </span>
          {text}
        </li>
      ))}
    </ul>
  );
}
