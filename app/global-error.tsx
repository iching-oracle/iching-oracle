"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/errors/error-fallback";
import { reportClientError } from "@/lib/monitoring/report-error";
import { USER_MESSAGES } from "@/lib/errors/messages";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error, {
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
      component: "global-error",
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
