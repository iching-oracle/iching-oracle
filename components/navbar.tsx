import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { CreditBadge } from "@/components/credits/credit-badge";
import { LanguageSelector } from "@/components/language-selector";
import { NavbarDesktopNav, NavbarMobileMenu } from "@/components/navbar/navbar-navigation";
import { handleSignOut } from "@/lib/actions/auth";
import { getPreferredLanguageForUser } from "@/lib/user/preferred-language";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;
  const isLoggedIn = Boolean(user?.id);
  const preferredLanguage =
    user?.id != null ? await getPreferredLanguageForUser(user.id) : null;

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-zen-bg/85 backdrop-blur-md">
      <nav
        className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:h-[3.75rem] sm:gap-4 sm:px-8 lg:px-10"
        aria-label="Main"
      >
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 transition-opacity duration-200 hover:opacity-90 sm:gap-3"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-gold/15 bg-zen-surface/60 text-base text-amber-gold shadow-[0_0_16px_-10px_rgba(197,160,89,0.45)] transition-shadow duration-300 group-hover:shadow-[0_0_22px_-8px_rgba(197,160,89,0.55)] sm:h-9 sm:w-9 sm:text-lg"
            aria-hidden
          >
            ☰
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/90 sm:text-[11px] sm:tracking-[0.26em]">
            ICHING-ORACLE
          </span>
        </Link>

        <NavbarDesktopNav isLoggedIn={isLoggedIn} />

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-2.5">
          {isLoggedIn && user ? (
            <>
              <CreditBadge userId={user.id} />
              {preferredLanguage ? (
                <LanguageSelector
                  currentLanguage={preferredLanguage}
                  className="hidden sm:inline-flex"
                />
              ) : null}
              <div className="hidden items-center gap-2 md:flex">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full border border-white/10 object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-zen-surface/80 text-xs font-medium text-amber-gold/90">
                    {(user.name?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
                  </span>
                )}
                <span className="max-w-[7rem] truncate text-sm text-foreground/85 lg:max-w-[9rem]">
                  {user.name ?? user.email}
                </span>
              </div>
              <form action={handleSignOut} className="hidden sm:block">
                <button
                  type="submit"
                  className="rounded-full border border-white/[0.08] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-zen-muted transition-all duration-200 hover:border-amber-gold/35 hover:text-amber-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold/50"
                >
                  Sign out
                </button>
              </form>
              <NavbarMobileMenu
                isLoggedIn={isLoggedIn}
                signOutAction={handleSignOut}
                preferredLanguage={preferredLanguage}
              />
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="rounded-md px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-zen-muted transition-colors duration-200 hover:text-amber-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold/50"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-amber-gold/25 bg-amber-gold/10 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-amber-gold transition-all duration-200 hover:border-amber-gold/45 hover:bg-amber-gold/15 hover:shadow-[0_0_20px_-8px_rgba(197,160,89,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold/50"
              >
                Register
              </Link>
              <NavbarMobileMenu
                isLoggedIn={false}
                signOutAction={handleSignOut}
                preferredLanguage={null}
              />
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
