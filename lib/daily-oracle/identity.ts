import "server-only";

import { prisma } from "@/lib/prisma";

/** Session user ids can outlive the DB row (deleted account, stale JWT). */
export async function resolveValidUserId(
  sessionUserId: string | undefined | null,
): Promise<string | null> {
  if (!sessionUserId?.trim()) return null;

  const user = await prisma.user.findUnique({
    where: { id: sessionUserId },
    select: { id: true },
  });

  return user?.id ?? null;
}
