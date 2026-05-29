"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/errors/error-fallback";
import { USER_MESSAGES } from "@/lib/errors/messages";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void fetch("/api/monitoring/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        path: typeof window !== "undefined" ? window.location.pathname : undefined,
        component: "global-error",
      }),
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b0c10] text-[#e8e6e3]">
        <ErrorFallback
          title="Critical interruption"
          message={USER_MESSAGES.generic}
          reset={reset}
        />
      </body>
    </html>
  );
}
