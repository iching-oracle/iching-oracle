import { Prisma } from "@prisma/client";

const CONNECTION_ERROR_CODES = new Set([
  "P1000", // auth failed
  "P1001", // can't reach server
  "P1002", // server timed out
  "P1008", // operations timed out
  "P1017", // server closed connection
]);

const CONNECTION_MESSAGE_FRAGMENTS = [
  "too many connections",
  "connection exhausted",
  "too many clients",
  "fatal: too many connections",
  "remaining connection slots are reserved",
  "sorry, too many clients already",
  "connection pool timeout",
];

export function isPrismaConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return CONNECTION_ERROR_CODES.has(error.code);
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return true;
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return CONNECTION_MESSAGE_FRAGMENTS.some((fragment) => msg.includes(fragment));
  }

  return false;
}

export function isPrismaTimeoutError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P1008" || error.code === "P2024";
  }
  if (error instanceof Error) {
    return error.message.toLowerCase().includes("timed out");
  }
  return false;
}

export function prismaErrorCategory(error: unknown): "connection" | "timeout" | "other" {
  if (isPrismaConnectionError(error)) return "connection";
  if (isPrismaTimeoutError(error)) return "timeout";
  return "other";
}
