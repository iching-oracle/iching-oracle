import { FeatureCard } from "./FeatureCard";
import { CoinsIcon, ThoughtIcon, YarrowIcon } from "./MethodIcons";

const METHODS = [
  {
    titleEn: "Digital yarrow",
    accentZh: "籌",
    description:
      "The classical yarrow ritual, digitized — six passes mirroring the ancient stalk method.",
    icon: <YarrowIcon />,
  },
  {
    titleEn: "Three coins",
    accentZh: "錢",
    description:
      "Cast three coins six times. Heads and tails weave your changing lines with familiar simplicity.",
    icon: <CoinsIcon />,
  },
  {
    titleEn: "Mindful instant",
    accentZh: "念",
    description:
      "When the question is clear and the moment is ripe — one intention reveals the hexagram.",
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
        <p className="type-eyebrow mb-3">Divination methods</p>
        <h2
          id="methods-heading"
          className="type-display text-2xl sm:text-3xl"
        >
          Three paths to the hexagram
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {METHODS.map((method) => (
          <FeatureCard
            key={method.titleEn}
            titleEn={method.titleEn}
            accentZh={method.accentZh}
            description={method.description}
            icon={method.icon}
          />
        ))}
      </div>
    </section>
  );
}
