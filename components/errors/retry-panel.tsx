"use client";

type RetryPanelProps = {
  title: string;
  message: string;
  onRetry: () => void;
  retryLabel?: string;
  busy?: boolean;
};

export function RetryPanel({
  title,
  message,
  onRetry,
  retryLabel = "Retry",
  busy = false,
}: RetryPanelProps) {
  return (
    <div
      className="rounded-2xl border border-amber-gold/20 bg-amber-gold/5 p-6 text-center"
      role="alert"
    >
      <h3 className="font-serif text-lg text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-zen-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={busy}
        className="auth-btn-primary mt-4 min-h-[44px] px-6 text-sm disabled:opacity-50"
      >
        {busy ? "Retrying…" : retryLabel}
      </button>
    </div>
  );
}
