import Link from "next/link";

export default function ShareNotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.35em] text-zen-muted">
        Not available
      </p>
      <h1 className="mt-3 font-serif text-2xl text-foreground">
        This reading is not shared
      </h1>
      <p className="mt-3 text-sm text-zen-muted">
        The owner has not enabled a public link, or this share has been turned off.
      </p>
      <Link href="/reading/new" className="auth-btn-primary mt-8 inline-flex">
        Create your first oracle reading
      </Link>
    </div>
  );
}
