import { HexagramDisplay } from "@/components/HexagramDisplay";
import { getHexagram } from "@/lib/hexagrams";

type DailyHexagramDisplayProps = {
  hexagramNumber: number;
};

export function DailyHexagramDisplay({ hexagramNumber }: DailyHexagramDisplayProps) {
  const hex = getHexagram(hexagramNumber);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <HexagramDisplay hexagramNumber={hexagramNumber} size="lg" animated />
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-amber-gold">
          Hexagram {hex.number}
        </p>
        <p className="mt-2 font-serif text-2xl text-foreground sm:text-3xl">
          {hex.chineseName}
        </p>
        <p className="mt-1 text-sm text-zen-muted">{hex.title}</p>
      </div>
    </div>
  );
}
