"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SyncSubscriptionResponse = {
  ok?: boolean;
  isPremium?: boolean;
  message?: string;
  error?: string;
};

type SuccessSubscriptionSyncProps = {
  sessionId?: string;
};

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 15;

export function SuccessSubscriptionSync({
  sessionId,
}: SuccessSubscriptionSyncProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"syncing" | "ready" | "pending">(
    "syncing",
  );

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function syncOnce(): Promise<boolean> {
      const res = await fetch("/api/stripe/sync-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = (await res.json()) as SyncSubscriptionResponse;
      if (cancelled) return false;

      if (data.isPremium) {
        setStatus("ready");
        router.refresh();
        return true;
      }

      return false;
    }

    async function run() {
      while (!cancelled && attempts < MAX_ATTEMPTS) {
        attempts += 1;
        const activated = await syncOnce();
        if (activated || cancelled) {
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }

      if (!cancelled) {
        setStatus("pending");
        router.refresh();
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [router, sessionId]);

  if (status === "ready") {
    return (
      <p className="mt-2 text-xs text-emerald-300/90">
        Your Premium access is active.
      </p>
    );
  }

  if (status === "pending") {
    return (
      <p className="mt-2 text-xs text-zen-muted">
        Payment received — Premium may take a moment to activate. Refresh the
        page if features are not unlocked yet.
      </p>
    );
  }

  return (
    <p className="mt-2 text-xs text-zen-muted">
      Activating Premium access…
    </p>
  );
}
