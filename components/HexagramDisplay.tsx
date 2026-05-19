import { getHexagramLines } from "@/lib/hexagram-lines";

export type HexagramDisplayProps = {
  hexagramNumber: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
};

const SIZE_PRESETS = {
  sm: { width: 80, height: 6, gap: 8, segmentGap: 5 },
  md: { width: 120, height: 8, gap: 10, segmentGap: 6 },
  lg: { width: 180, height: 12, gap: 12, segmentGap: 8 },
} as const;

const LINE_GLOW =
  "shadow-[0_0_20px_rgba(251,191,36,0.35)] bg-amber-400";

function HexagramLine({
  isYang,
  height,
  segmentGap,
  animated,
  animationDelayMs,
}: {
  isYang: boolean;
  height: number;
  segmentGap: number;
  animated: boolean;
  animationDelayMs: number;
}) {
  const barStyle = { height: `${height}px` };
  const animationStyle = animated
    ? { animationDelay: `${animationDelayMs}ms` }
    : undefined;
  const animationClass = animated ? "hexagram-line-animate" : "";

  if (isYang) {
    return (
      <div
        className={`w-full rounded-full ${LINE_GLOW} ${animationClass}`}
        style={{ ...barStyle, ...animationStyle }}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={`flex w-full items-center justify-between ${animationClass}`}
      style={{
        gap: `${segmentGap}px`,
        ...animationStyle,
      }}
      aria-hidden
    >
      <div
        className={`flex-1 rounded-full ${LINE_GLOW}`}
        style={barStyle}
      />
      <div className={`flex-1 rounded-full ${LINE_GLOW}`} style={barStyle} />
    </div>
  );
}

export function HexagramDisplay({
  hexagramNumber,
  size = "md",
  animated = false,
}: HexagramDisplayProps) {
  const preset = SIZE_PRESETS[size];
  const lines = getHexagramLines(hexagramNumber);
  const displayOrder = [...lines].reverse();

  return (
    <div
      className="flex flex-col items-center"
      style={{
        width: `${preset.width}px`,
        gap: `${preset.gap}px`,
      }}
      role="img"
      aria-label={`Hexagram ${hexagramNumber}, six lines`}
    >
      {displayOrder.map((isYang, index) => {
        const lineIndexFromBottom = 5 - index;
        return (
          <HexagramLine
            key={lineIndexFromBottom}
            isYang={isYang}
            height={preset.height}
            segmentGap={preset.segmentGap}
            animated={animated}
            animationDelayMs={lineIndexFromBottom * 90}
          />
        );
      })}
    </div>
  );
}
