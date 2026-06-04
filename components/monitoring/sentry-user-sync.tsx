"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { setSentryUser } from "@/lib/monitoring/sentry";

/** Sets Sentry user context after login (id only — no PII). */
export function SentryUserSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      setSentryUser({ id: session.user.id });
      return;
    }
    if (status === "unauthenticated") {
      setSentryUser(null);
    }
  }, [session?.user?.id, status]);

  return null;
}
