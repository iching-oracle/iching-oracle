import "server-only";

import type { Prisma } from "@prisma/client";
import type { SystemEventLevel } from "@/types/trust";
import { prisma } from "@/lib/prisma";

export type LogEventInput = {
  level: SystemEventLevel;
  category: string;
  message: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  path?: string;
};

export async function logSystemEvent(input: LogEventInput): Promise<void> {
  const prefix = `[${input.category}]`;
  const line = `${prefix} ${input.message}`;

  if (input.level === "error") {
    console.error(line, input.metadata ?? "");
  } else if (input.level === "warn") {
    console.warn(line, input.metadata ?? "");
  } else {
    console.info(line, input.metadata ?? "");
  }

  try {
    await prisma.systemEvent.create({
      data: {
        level: input.level,
        category: input.category.slice(0, 64),
        message: input.message.slice(0, 4000),
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        userId: input.userId,
        path: input.path?.slice(0, 500),
      },
    });
  } catch (err) {
    console.error("[monitoring] Failed to persist SystemEvent", err);
  }
}

export function captureClientError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  void logSystemEvent({
    level: "error",
    category: "client",
    message: error instanceof Error ? error.message : "Client error",
    metadata: {
      ...context,
      stack: error instanceof Error ? error.stack : undefined,
    },
  });
}
