import { describe, expect, it, vi } from "vitest";
import type { CronJobResult } from "@/lib/email/cron-runner";
import { runEmailBatch } from "@/lib/email/cron-runner";

describe("weekly oracle cron batch", () => {
  it("counts sent, skipped, and failed outcomes", async () => {
    const send = vi
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false, reason: "opt_out" })
      .mockResolvedValueOnce({ ok: false, reason: "send_failed" });

    const users = [{ id: "u1" }, { id: "u2" }, { id: "u3" }];
    const result: CronJobResult = await runEmailBatch(
      "weekly_oracle",
      users,
      async (user) => send(user.id),
    );

    expect(result.processed).toBe(3);
    expect(result.sent).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.failed).toBe(1);
    expect(send).toHaveBeenCalledTimes(3);
  });
});
