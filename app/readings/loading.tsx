import { ReadingJournalSkeleton } from "@/components/journal/ReadingCardSkeleton";

export default function ReadingsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
      <div className="mb-8 h-10 w-64 animate-pulse rounded bg-white/10" />
      <ReadingJournalSkeleton />
    </div>
  );
}
