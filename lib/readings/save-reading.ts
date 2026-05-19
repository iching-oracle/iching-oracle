import { createPlaceholderReading } from "@/lib/readings/create-placeholder";
import { prisma } from "@/lib/prisma";

/** Persist a new reading for the given user (shared by server action and API route). */
export async function saveReadingForUser(userId: string, question: string) {
  const trimmed = question.trim();
  const { hexagram, changing, interpretation } = createPlaceholderReading();

  return prisma.reading.create({
    data: {
      userId,
      question: trimmed,
      hexagram,
      changing,
      interpretation,
    },
  });
}
