"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/errors/error-fallback";
import { reportClientError } from "@/lib/monitoring/report-error";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error, { component: "admin-error" });
  }, [error]);

  return (
    <ErrorFallback
      title="Admin panel unavailable"
      message="We could not load this admin view. Try again or check server logs."
      reset={reset}
    />
  );
}
