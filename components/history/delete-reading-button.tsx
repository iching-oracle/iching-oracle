"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteReading } from "@/lib/actions/readings";

type DeleteReadingButtonProps = {
  readingId: string;
};

export function DeleteReadingButton({ readingId }: DeleteReadingButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this reading permanently? This cannot be undone.",
    );
    if (!confirmed) return;

    setIsPending(true);
    setError(null);

    const result = await deleteReading(readingId);

    if (result.error) {
      setError(result.error);
      setIsPending(false);
      return;
    }

    router.push("/history");
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition-colors hover:border-red-400/50 hover:bg-red-500/20 disabled:opacity-60"
      >
        {isPending ? "Deleting…" : "Delete Reading"}
      </button>
      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
