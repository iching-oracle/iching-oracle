import { CastingSummary } from "@/components/readings/casting-summary";
import { formatHexagramInline, getHexagram } from "@/lib/hexagrams";

type HexagramSummaryProps = {
  question: string;
  primaryNumber: number;
  transformedNumber?: number | null;
  changingLinePositions: number[];
};

export function HexagramSummary({
  question,
  primaryNumber,
  transformedNumber,
  changingLinePositions,
}: HexagramSummaryProps) {
  const primary = getHexagram(primaryNumber);
  const transformed = transformedNumber
    ? getHexagram(transformedNumber)
    : null;

  return (
    <div className="space-y-4 rounded-2xl border border-amber-gold/20 bg-gradient-to-br from-zen-surface/90 via-cosmic-deep/30 to-zen-bg/80 p-5 backdrop-blur-xl sm:p-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-cosmic-violet">
          Your question
        </p>
        <p className="mt-2 font-serif text-lg leading-relaxed text-foreground sm:text-xl">
          {question}
        </p>
      </div>
      <p className="text-sm text-zen-muted">
        {formatHexagramInline(primary)}
        {transformed ? ` → ${formatHexagramInline(transformed)}` : null}
      </p>
      <CastingSummary
        primaryNumber={primaryNumber}
        transformedNumber={transformedNumber}
        changingLinePositions={changingLinePositions}
        animated
      />
    </div>
  );
}
