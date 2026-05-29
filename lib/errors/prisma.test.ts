import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import {
  isPrismaConnectionError,
  isPrismaTimeoutError,
} from "@/lib/errors/prisma";

describe("isPrismaConnectionError", () => {
  it("detects too many connections message", () => {
    expect(
      isPrismaConnectionError(new Error("FATAL: too many connections for role")),
    ).toBe(true);
  });

  it("detects P1001 known request error", () => {
    expect(
      isPrismaConnectionError(
        new Prisma.PrismaClientKnownRequestError("Can't reach database", {
          code: "P1001",
          clientVersion: "6.19.2",
        }),
      ),
    ).toBe(true);
  });

  it("returns false for unrelated errors", () => {
    expect(isPrismaConnectionError(new Error("Unique constraint failed"))).toBe(
      false,
    );
  });
});

describe("isPrismaTimeoutError", () => {
  it("detects P1008", () => {
    expect(
      isPrismaTimeoutError(
        new Prisma.PrismaClientKnownRequestError("timeout", {
          code: "P1008",
          clientVersion: "6.19.2",
        }),
      ),
    ).toBe(true);
  });
});
