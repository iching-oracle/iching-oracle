import "server-only";

import { PrismaClient, type Prisma } from "@prisma/client";

/**
 * Bump when the Prisma schema changes to refresh the dev singleton after hot reload.
 * Latest: closed_beta + credit_billing_cycle migrations.
 */
const PRISMA_SCHEMA_VERSION = "20260601120000_closed_beta";

const SLOW_QUERY_MS = 750;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion: string | undefined;
  prismaShutdownRegistered: boolean | undefined;
};

/** Runtime URL only — never use DIRECT_URL for queries (migrations only). */
export function getRuntimeDatabaseUrl(): string {
  const raw =
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.PRISMA_DATABASE_URL?.trim();

  if (!raw) {
    throw new Error(
      "DATABASE_URL is not set. Add your PostgreSQL connection string to .env",
    );
  }

  return optimizeUrlForRuntime(raw);
}

/**
 * Serverless-safe URL tuning: prefer pooled DATABASE_URL + cap connections per isolate.
 *
 * Production (Vercel/Neon/Supabase): use a pooler URL for DATABASE_URL and a direct
 * URL for DIRECT_URL (migrations). Optional Prisma Accelerate: set DATABASE_URL to
 * the prisma:// accelerate URL — no further changes needed here.
 */
function optimizeUrlForRuntime(url: string): string {
  if (url.startsWith("prisma://") || url.startsWith("prisma+postgres://")) {
    return url;
  }

  try {
    const parsed = new URL(url);
    const params = parsed.searchParams;

    if (!params.has("connection_limit")) {
      const limit =
        process.env.PRISMA_CONNECTION_LIMIT?.trim() ||
        (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME ? "1" : "5");
      params.set("connection_limit", limit);
    }

    if (!params.has("pool_timeout")) {
      params.set("pool_timeout", process.env.PRISMA_POOL_TIMEOUT?.trim() || "20");
    }

    if (!params.has("connect_timeout")) {
      params.set("connect_timeout", process.env.PRISMA_CONNECT_TIMEOUT?.trim() || "10");
    }

    parsed.search = params.toString();
    return parsed.toString();
  } catch {
    return url;
  }
}

function createLogConfig(): Prisma.LogLevel[] {
  if (process.env.NODE_ENV === "production") {
    return ["error"];
  }
  if (process.env.PRISMA_LOG_QUERIES === "true") {
    return ["query", "warn", "error"];
  }
  return ["warn", "error"];
}

function attachSlowQueryLogging(client: PrismaClient): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    return client;
  }

  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const start = performance.now();
          const result = await query(args);
          const ms = performance.now() - start;
          if (ms >= SLOW_QUERY_MS) {
            console.warn(
              `[prisma] Slow query ${String(model)}.${operation} (${Math.round(ms)}ms)`,
            );
          }
          return result;
        },
      },
    },
  }) as unknown as PrismaClient;
}

function createPrismaClient(): PrismaClient {
  const base = new PrismaClient({
    datasources: {
      db: { url: getRuntimeDatabaseUrl() },
    },
    log: createLogConfig(),
  });

  return attachSlowQueryLogging(base);
}

function registerGracefulShutdown(client: PrismaClient): void {
  if (globalForPrisma.prismaShutdownRegistered) return;
  globalForPrisma.prismaShutdownRegistered = true;

  const shutdown = () => {
    void client.$disconnect();
  };

  process.on("beforeExit", shutdown);
  process.on("SIGINT", () => {
    shutdown();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    shutdown();
    process.exit(0);
  });
}

function getPrismaClient(): PrismaClient {
  const staleDevClient =
    process.env.NODE_ENV !== "production" &&
    globalForPrisma.prisma &&
    globalForPrisma.prismaSchemaVersion !== PRISMA_SCHEMA_VERSION;

  if (staleDevClient) {
    void globalForPrisma.prisma?.$disconnect();
    globalForPrisma.prisma = undefined;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
    registerGracefulShutdown(globalForPrisma.prisma);
  }

  return globalForPrisma.prisma;
}

/** Singleton Prisma client — import this everywhere; never `new PrismaClient()`. */
export const prisma = getPrismaClient();

/** Disconnect for scripts/tests; app runtime uses process signal handlers. */
export async function disconnectPrisma(): Promise<void> {
  if (globalForPrisma.prisma) {
    await globalForPrisma.prisma.$disconnect();
    globalForPrisma.prisma = undefined;
  }
}

export type { PrismaClient };
