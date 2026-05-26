import type { NextAuthConfig } from "next-auth";
import { getAuthSecret } from "@/lib/auth-env";

/**
 * Edge-safe Auth.js config — used by middleware only.
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
      const isProtected =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/reading") ||
        nextUrl.pathname.startsWith("/readings") ||
        nextUrl.pathname.startsWith("/history") ||
        nextUrl.pathname.startsWith("/insights") ||
        nextUrl.pathname.startsWith("/oracle") ||
        nextUrl.pathname.startsWith("/settings") ||
        nextUrl.pathname.startsWith("/payment");

      if (isProtected && !isLoggedIn) {
        return false;
      }

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
