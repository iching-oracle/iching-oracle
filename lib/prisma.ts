import { PrismaClient } from "@prisma/client";

/** Bump when the Prisma schema changes to refresh the dev singleton. */
const PRISMA_SCHEMA_VERSION = "20260521140000_subscription_fields";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion: string | undefined;
};

function getDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.PRISMA_DATABASE_URL?.trim();

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Prisma Postgres or PostgreSQL connection string to .env",
    );
  }

  return url;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: { url: getDatabaseUrl() },
    },
  });
}

function getPrismaClient(): PrismaClient {
  const staleDevClient =
    process.env.NODE_ENV !== "production" &&
    globalForPrisma.prismaSchemaVersion !== PRISMA_SCHEMA_VERSION;

  if (staleDevClient && globalForPrisma.prisma) {
    void globalForPrisma.prisma.$disconnect();
    globalForPrisma.prisma = undefined;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
    }
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrismaClient();
