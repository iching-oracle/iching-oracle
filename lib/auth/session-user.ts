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

/** Thrown when JWT user id has no matching User row (deleted account, stale token). */
export class StaleSessionError extends Error {
  constructor() {
    super("Session user not found");
    this.name = "StaleSessionError";
  }
}

export async function assertValidUserId(
  sessionUserId: string | undefined | null,
): Promise<string> {
  const id = await resolveValidUserId(sessionUserId);
  if (!id) throw new StaleSessionError();
  return id;
}
