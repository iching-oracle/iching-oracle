import Link from "next/link";

export const metadata = {
  title: "Payment Cancelled | ICHING-ORACLE",
};

export default function PaymentCancelPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-6 py-16">
      <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-zen-surface/80 p-8 text-center backdrop-blur-xl sm:p-10">
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Payment Cancelled
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zen-muted">
          No worries, you can try again anytime.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/dashboard" className="auth-btn-primary text-center">
            Back to dashboard
          </Link>
          <Link href="/" className="auth-btn-secondary text-center">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
