import { describe, expect, it } from "vitest";
import { z } from "zod";

const patchSchema = z
  .object({
    emailDailyGuidance: z.boolean().optional(),
    emailWeeklyReflection: z.boolean().optional(),
    emailReengagement: z.boolean().optional(),
    emailProductUpdates: z.boolean().optional(),
    emailMarketing: z.boolean().optional(),
    weeklyOracleEnabled: z.boolean().optional(),
    globalUnsubscribe: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field required",
  });

describe("email preferences patch schema", () => {
  it("accepts weeklyOracleEnabled toggle", () => {
    const parsed = patchSchema.safeParse({ weeklyOracleEnabled: true });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.weeklyOracleEnabled).toBe(true);
    }
  });

  it("rejects empty payloads", () => {
    const parsed = patchSchema.safeParse({});
    expect(parsed.success).toBe(false);
  });
});
