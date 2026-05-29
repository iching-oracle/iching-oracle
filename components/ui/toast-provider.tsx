"use client";

import { Toaster } from "sonner";

/** Global toast notifications — premium dark styling. */
export function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border border-white/10 bg-zen-surface/95 text-foreground shadow-xl backdrop-blur-xl",
          title: "text-sm font-medium",
          description: "text-xs text-zen-muted",
          actionButton: "auth-btn-primary !text-xs !py-1.5 !px-3",
          cancelButton:
            "rounded-full border border-white/15 !text-xs text-zen-muted",
          error: "border-red-500/30 bg-red-950/40",
          success: "border-emerald-500/30 bg-emerald-950/30",
        },
      }}
      closeButton
      richColors
    />
  );
}
