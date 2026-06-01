import Link from "next/link";
import { getCreditBalance } from "@/lib/credits/balance";

type CreditBadgeProps = {
  userId: string;
};

export async function CreditBadge({ userId }: CreditBadgeProps) {
  const balance = await getCreditBalance(userId);
  if (!balance) return null;

  const warn = balance.lowCreditWarning;

  return (
    <Link
      href="/billing"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors duration-200 ${
        warn
          ? "border-amber-gold/50 bg-amber-gold/15 text-amber-gold"
          : "border-white/10 bg-zen-surface/60 text-zen-muted hover:border-amber-gold/30 hover:text-amber-gold"
      }`}
      title="View billing & credits"
    >
      <span aria-hidden>✦</span>
      <span>{balance.credits}</span>
      <span className="opacity-60">credits</span>
    </Link>
  );
}
