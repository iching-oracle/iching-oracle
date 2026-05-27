import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { CreditBadge } from "@/components/credits/credit-badge";
import { LanguageSelector } from "@/components/language-selector";
import { handleSignOut } from "@/lib/actions/auth";
import { getPreferredLanguageForUser } from "@/lib/user/preferred-language";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;
  const preferredLanguage =
    user?.id != null ? await getPreferredLanguageForUser(user.id) : null;

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-zen-bg/80 backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-12"
        aria-label="Main"
      >
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3 transition-opacity hover:opacity-90"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-gold/20 bg-zen-surface/80 text-lg text-amber-gold shadow-[0_0_20px_-8px_rgba(197,160,89,0.5)] transition-shadow duration-300 group-hover:shadow-[0_0_28px_-6px_rgba(197,160,89,0.65)]"
            aria-hidden
          >
            ☰
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.28em] text-foreground/90 sm:text-sm">
            ICHING-ORACLE
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/daily"
            className="hidden text-xs font-medium uppercase tracking-[0.2em] text-zen-muted transition-colors hover:text-amber-gold sm:inline"
          >
            Daily
          </Link>
          <Link
            href="/hexagrams"
            className="hidden text-xs font-medium uppercase tracking-[0.2em] text-zen-muted transition-colors hover:text-amber-gold sm:inline"
          >
            Hexagrams
          </Link>
          <Link
            href="/learn"
            className="hidden text-xs font-medium uppercase tracking-[0.2em] text-zen-muted transition-colors hover:text-amber-gold sm:inline"
          >
            Learn
          </Link>
          <Link
            href="/pricing"
            className="hidden text-xs font-medium uppercase tracking-[0.2em] text-zen-muted transition-colors hover:text-amber-gold sm:inline"
          >
            Premium
          </Link>
          <Link
            href="/#methods"
            className="hidden text-xs font-medium uppercase tracking-[0.2em] text-zen-muted transition-colors hover:text-amber-gold sm:inline"
          >
            Methods
          </Link>

          {user ? (
            <>
              <Link
                href="/oracle/chat"
                className="hidden text-xs font-medium uppercase tracking-[0.2em] text-zen-muted transition-colors hover:text-cosmic-violet sm:inline"
              >
                Oracle
              </Link>
              <Link
                href="/dashboard"
                className="hidden text-xs font-medium uppercase tracking-[0.2em] text-zen-muted transition-colors hover:text-cosmic-violet sm:inline"
              >
                Dashboard
              </Link>
              <Link
                href="/insights"
                className="hidden text-xs font-medium uppercase tracking-[0.2em] text-zen-muted transition-colors hover:text-amber-gold sm:inline"
              >
                Insights
              </Link>
              <Link
                href="/settings/memory"
                className="hidden text-xs font-medium uppercase tracking-[0.2em] text-zen-muted transition-colors hover:text-amber-gold sm:inline"
              >
                Memory
              </Link>
              <Link
                href="/history"
                className="hidden items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-zen-muted transition-colors hover:text-amber-gold sm:inline-flex"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden
                >
                  <path d="M12 7v14" />
                  <path d="M5.5 4.5A2.5 2.5 0 0 0 3 7v13h9" />
                  <path d="M18.5 4.5A2.5 2.5 0 0 1 21 7v13h-9" />
                </svg>
                History
              </Link>
              <CreditBadge userId={user.id} />
              {preferredLanguage ? (
                <LanguageSelector currentLanguage={preferredLanguage} />
              ) : null}
              <div className="flex items-center gap-2 sm:gap-3">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full border border-cosmic-purple/40 object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cosmic-purple/40 bg-cosmic-deep/50 text-xs font-medium text-cosmic-violet">
                    {(user.name?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
                  </span>
                )}
                <span className="hidden max-w-[120px] truncate text-sm text-foreground/90 md:inline">
                  {user.name ?? user.email}
                </span>
              </div>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-zen-muted transition-colors hover:border-amber-gold/40 hover:text-amber-gold sm:px-4"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-medium uppercase tracking-[0.2em] text-zen-muted transition-colors hover:text-amber-gold"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-cosmic-purple/40 bg-cosmic-purple/10 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-cosmic-violet transition-all hover:border-cosmic-violet/60 hover:bg-cosmic-purple/20 hover:shadow-[0_0_20px_-6px_rgba(139,92,246,0.5)] sm:px-4"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
