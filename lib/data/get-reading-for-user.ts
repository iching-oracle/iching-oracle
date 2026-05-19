import { prisma } from "@/lib/prisma";

/** Fetch a single reading only if it belongs to the given user. */
export async function getReadingForUser(userId: string, readingId: string) {
  return prisma.reading.findFirst({
    where: {
      id: readingId,
      userId,
    },
  });
}
