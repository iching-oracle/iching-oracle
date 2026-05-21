import { ReadingCard } from "@/components/journal/ReadingCard";
import type { JournalReadingItem } from "@/types/reading-journal";

type ReadingGridProps = {
  readings: JournalReadingItem[];
  locale?: string;
};

export function ReadingGrid({ readings, locale }: ReadingGridProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {readings.map((reading, index) => (
        <ReadingCard
          key={reading.id}
          reading={reading}
          locale={locale}
          index={index}
        />
      ))}
    </ul>
  );
}
