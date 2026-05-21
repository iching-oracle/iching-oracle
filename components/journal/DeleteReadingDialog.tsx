"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deleteReading } from "@/lib/actions/readings";

type DeleteReadingDialogProps = {
  readingId: string;
  questionPreview: string;
};

export function DeleteReadingDialog({
  readingId,
  questionPreview,
}: DeleteReadingDialogProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function open() {
    setError(null);
    dialogRef.current?.showModal();
  }

  function close() {
    if (!isPending) dialogRef.current?.close();
  }

  function confirmDelete() {
    startTransition(async () => {
      setError(null);
      const result = await deleteReading(readingId);
      if (result.error) {
        setError(result.error);
        return;
      }
      dialogRef.current?.close();
      router.push("/readings");
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition-colors hover:bg-red-500/20"
      >
        Delete reading
      </button>

      <dialog
        ref={dialogRef}
        className="w-[calc(100%-2rem)] max-w-md rounded-2xl border border-red-500/30 bg-zen-surface p-0 text-foreground backdrop:bg-black/70"
      >
        <div className="p-6 sm:p-8">
          <h3 className="font-serif text-xl text-red-300">Delete this reading?</h3>
          <p className="mt-3 text-sm text-zen-muted">
            This will permanently remove this consultation from your journal.
            This cannot be undone.
          </p>
          <p className="mt-3 rounded-lg border border-white/10 bg-zen-elevated/50 px-3 py-2 text-sm italic text-foreground/80 line-clamp-2">
            {questionPreview}
          </p>
          {error ? (
            <p className="mt-3 text-sm text-red-300" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={close}
              disabled={isPending}
              className="auth-btn-secondary disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={isPending}
              className="rounded-lg border border-red-500 bg-red-600/90 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
            >
              {isPending ? "Deleting…" : "Delete permanently"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
