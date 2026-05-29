"use client";

import { toast } from "sonner";
import { USER_MESSAGES } from "@/lib/errors/messages";

export function showError(message: string, options?: { retry?: () => void }) {
  toast.error(message, {
    action: options?.retry
      ? { label: "Retry", onClick: options.retry }
      : undefined,
  });
}

export function showSuccess(message: string) {
  toast.success(message);
}

export function showOracleError(retry?: () => void) {
  showError(USER_MESSAGES.oracleClouded, { retry });
}

export function showRateLimit(message?: string) {
  toast.error(message ?? USER_MESSAGES.rateLimited, { duration: 6000 });
}

export function showPaymentError(retry?: () => void) {
  showError(USER_MESSAGES.paymentFailed, { retry });
}
