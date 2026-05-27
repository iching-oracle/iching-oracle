"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/errors/error-fallback";

export default function Error({
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
      }),
    });
  }, [error]);

  return (
    <ErrorFallback
      title="The thread slipped"
      message="An unexpected error occurred. You can try again or return to your dashboard."
      reset={reset}
    />
  );
}
