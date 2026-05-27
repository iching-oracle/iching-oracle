"use client";

import { ErrorFallback } from "@/components/errors/error-fallback";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b0c10] text-[#e8e6e3]">
        <ErrorFallback
          title="Critical interruption"
          message="The application encountered a severe error. Please refresh or try again later."
          reset={reset}
        />
      </body>
    </html>
  );
}
