import type { NextAuthConfig } from "next-auth";
import { getAuthSecret } from "@/lib/auth-env";
import { isAdminSessionUser } from "@/lib/admin/edge-admin";

/**
 * Edge-safe Auth.js config — used by proxy only.
 * Do not import Prisma, bcrypt, or other Node-only modules here.
 */
export const authConfig = {
  secret: getAuthSecret(),
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute =
        nextUrl.pathname === "/login" ||
        nextUrl.pathname === "/register" ||
        nextUrl.pathname.startsWith("/verify-email") ||
        nextUrl.pathname === "/account-deleted";
      const readingSegment = nextUrl.pathname.match(/^\/reading\/([^/]+)$/)?.[1];
      const isPublicReadingSlug =
        readingSegment && !/^c[a-z0-9]{20,}$/i.test(readingSegment);

      const isProtected =
        nextUrl.pathname.startsWith("/dashboard") ||
        (nextUrl.pathname.startsWith("/reading") && !isPublicReadingSlug) ||
        nextUrl.pathname.startsWith("/readings") ||
        nextUrl.pathname.startsWith("/history") ||
        nextUrl.pathname.startsWith("/insights") ||
        nextUrl.pathname.startsWith("/oracle") ||
        nextUrl.pathname.startsWith("/beta/profile") ||
        nextUrl.pathname.startsWith("/settings") ||
        nextUrl.pathname.startsWith("/billing") ||
        nextUrl.pathname.startsWith("/payment") ||
        nextUrl.pathname.startsWith("/admin");

      if (isProtected && !isLoggedIn) {
        return false;
      }

      if (nextUrl.pathname.startsWith("/admin") && isLoggedIn) {
        const user = auth?.user as { email?: string | null; role?: string };
        if (!isAdminSessionUser(user)) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
