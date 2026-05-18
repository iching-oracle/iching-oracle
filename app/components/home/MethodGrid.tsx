import { FeatureCard } from "./FeatureCard";
import { CoinsIcon, ThoughtIcon, YarrowIcon } from "./MethodIcons";

const METHODS = [
  {
    titleZh: "數位籌策",
    titleEn: "Digital Yarrow Stalks",
    description:
      "The classical yarrow ritual, digitized — six passes of division mirroring the ancient stalk method.",
    icon: <YarrowIcon />,
  },
  {
    titleZh: "三錢問卜",
    titleEn: "Three Coins Toss",
    description:
      "Cast three coins six times. Heads and tails weave your changing lines with familiar simplicity.",
    icon: <CoinsIcon />,
  },
  {
    titleZh: "一念即卦",
    titleEn: "Instant Thought",
    description:
      "When the question is clear and the moment is ripe — a single mindful intention reveals the hexagram.",
    icon: <ThoughtIcon />,
  },
] as const;

export function MethodGrid() {
  return (
    <section
      id="methods"
      className="py-12 sm:py-16"
      aria-labelledby="methods-heading"
    >
      <div className="mb-12 text-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-zen-muted">
          Divination Methods
        </p>
        <h2
          id="methods-heading"
          className="font-serif text-2xl font-semibold text-foreground sm:text-3xl"
        >
          三種起卦之道
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {METHODS.map((method) => (
          <FeatureCard
            key={method.titleZh}
            titleZh={method.titleZh}
            titleEn={method.titleEn}
            description={method.description}
            icon={method.icon}
          />
        ))}
      </div>
    </section>
  );
}
