import Link from "next/link";
import { HexagramDisplay } from "@/components/readings/hexagram-display";
import { getHexagram } from "@/lib/hexagrams";

type ReadingCardProps = {
  id: string;
  question: string;
  hexagram: number;
  createdAt: Date;
};

export function ReadingCard({
  id,
  question,
  hexagram,
  createdAt,
}: ReadingCardProps) {
  const info = getHexagram(hexagram);
  const date = new Intl.DateTimeFormat("zh-Hant", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(createdAt);

  return (
    <Link
      href={`/reading/${id}`}
      className="tap-feedback group block rounded-2xl border border-white/[0.08] bg-zen-elevated/40 p-5 transition-all duration-300 active:scale-[0.99] hover:border-amber-gold/35 hover:bg-zen-elevated/70 hover:shadow-[0_0_32px_-12px_rgba(197,160,89,0.3)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-medium text-foreground group-hover:text-amber-glow">
            {question}
          </p>
          <p className="mt-2 text-xs text-zen-muted">{date}</p>
        </div>
        <HexagramDisplay
          hexagram={info}
          variant="compact"
          showInline={false}
        />
      </div>
    </Link>
  );
}
