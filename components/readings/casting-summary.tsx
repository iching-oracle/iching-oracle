import { HexagramDisplay } from "@/components/HexagramDisplay";
import { HexagramDisplay as HexagramTitleCard } from "@/components/readings/hexagram-display";
import { formatChangingLines } from "@/lib/iching";
import { formatHexagramInline, getHexagram } from "@/lib/hexagrams";

type CastingSummaryProps = {
  primaryNumber: number;
  transformedNumber?: number | null;
  changingLinePositions: number[];
  animated?: boolean;
};

export function CastingSummary({
  primaryNumber,
  transformedNumber,
  changingLinePositions,
  animated = false,
}: CastingSummaryProps) {
  const primary = getHexagram(primaryNumber);
  const transformed = transformedNumber ? getHexagram(transformedNumber) : null;
  const changingText = formatChangingLines(changingLinePositions);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-zen-bg/30 px-4 py-3 text-sm text-foreground/90">
        <p>
          <span className="text-zen-muted">動爻：</span>
          {changingText}
        </p>
      </div>

      <div
        className={
          transformed
            ? "grid gap-8 lg:grid-cols-2"
            : "grid gap-8 md:grid-cols-2"
        }
      >
        <HexagramCard
          label="本卦"
          hexagram={primary}
          hexagramNumber={primaryNumber}
          animated={animated}
        />
        {transformed ? (
          <HexagramCard
            label="變卦"
            hexagram={transformed}
            hexagramNumber={transformedNumber!}
            animated={animated}
          />
        ) : null}
      </div>
    </div>
  );
}

function HexagramCard({
  label,
  hexagram,
  hexagramNumber,
  animated,
}: {
  label: string;
  hexagram: ReturnType<typeof getHexagram>;
  hexagramNumber: number;
  animated: boolean;
}) {
  return (
    <div className="rounded-2xl border border-amber-gold/20 bg-zen-surface/50 p-6">
      <p className="text-xs font-medium uppercase tracking-widest text-amber-gold">
        {label}
      </p>
      <p className="mt-1 text-sm text-zen-muted">
        {formatHexagramInline(hexagram)}
      </p>
      <div className="mt-6 grid items-center gap-6 sm:grid-cols-2">
        <HexagramTitleCard hexagram={hexagram} variant="detail" showInline={false} />
        <div className="flex justify-center sm:justify-end">
          <div className="rounded-2xl border border-amber-gold/15 bg-zen-bg/40 p-5 shadow-[0_0_48px_-12px_rgba(251,191,36,0.2)]">
            <HexagramDisplay
              hexagramNumber={hexagramNumber}
              size="lg"
              animated={animated}
            />
          </div>
        </div>
      </div>
      <p className="mt-4 font-serif text-base italic leading-relaxed text-foreground/90">
        {hexagram.judgment}
      </p>
    </div>
  );
}
