import "server-only";

import { NextResponse } from "next/server";
import { USER_MESSAGES } from "@/lib/errors/messages";
import {
  isPrismaConnectionError,
  isPrismaTimeoutError,
  prismaErrorCategory,
} from "@/lib/errors/prisma";
import { logSystemEvent } from "@/lib/monitoring/logger";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "INSUFFICIENT_CREDITS"
  | "AI_FAILED"
  | "PAYMENT_FAILED"
  | "DATABASE_UNAVAILABLE"
  | "INTERNAL";

type ApiErrorBody = {
  error: string;
  code?: ApiErrorCode | string;
  retryAfterSec?: number;
};

export function apiError(
  status: number,
  message: string,
  options?: { code?: ApiErrorCode | string; retryAfterSec?: number },
): NextResponse<ApiErrorBody> {
  const headers: HeadersInit = {};
  if (options?.retryAfterSec) {
    headers["Retry-After"] = String(options.retryAfterSec);
  }
  return NextResponse.json(
    {
      error: message,
      code: options?.code,
      retryAfterSec: options?.retryAfterSec,
    },
    { status, headers },
  );
}

export function apiUnauthorized(): NextResponse<ApiErrorBody> {
  return apiError(401, USER_MESSAGES.authRequired, { code: "UNAUTHORIZED" });
}

export function apiRateLimited(
  message: string = USER_MESSAGES.rateLimitedShort,
  retryAfterSec?: number,
): NextResponse<ApiErrorBody> {
  return apiError(429, message, {
    code: "RATE_LIMITED",
    retryAfterSec,
  });
}

export function apiValidation(message: string): NextResponse<ApiErrorBody> {
  return apiError(400, message, { code: "VALIDATION" });
}

export async function handleRouteError(
  error: unknown,
  context: {
    category: string;
    userMessage?: string;
    userId?: string;
    path?: string;
  },
): Promise<NextResponse<ApiErrorBody>> {
  const internal =
    error instanceof Error ? error.message : String(error);

  const dbCategory = prismaErrorCategory(error);

  await logSystemEvent({
    level: "error",
    category:
      dbCategory === "connection" || dbCategory === "timeout"
        ? "database_connection"
        : context.category,
    message: internal.slice(0, 4000),
    userId: context.userId,
    path: context.path,
    metadata: {
      stack: error instanceof Error ? error.stack : undefined,
      dbCategory,
      prismaConnectionError: isPrismaConnectionError(error),
    },
  });

  if (isPrismaConnectionError(error)) {
    return apiError(503, USER_MESSAGES.databaseBusy, {
      code: "DATABASE_UNAVAILABLE",
    });
  }

  if (isPrismaTimeoutError(error)) {
    return apiError(503, USER_MESSAGES.databaseUnavailable, {
      code: "DATABASE_UNAVAILABLE",
    });
  }

  return apiError(500, context.userMessage ?? USER_MESSAGES.generic, {
    code: "INTERNAL",
  });
}
