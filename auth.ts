import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { Adapter } from "next-auth/adapters";
import type { Provider } from "next-auth/providers";
import { authConfig } from "@/auth.config";
import {
  getAuthConfigIssues,
  getAuthSecret,
  getGoogleOAuthConfig,
} from "@/lib/auth-env";
import { UnverifiedEmailError } from "@/lib/auth-errors";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server";

const authSecret = getAuthSecret();
const googleOAuth = getGoogleOAuthConfig();

if (process.env.NODE_ENV === "production") {
  const issues = getAuthConfigIssues();
  for (const issue of issues) {
    console.error(`[auth] ${issue}`);
  }
}

const providers: Provider[] = [];

if (googleOAuth.enabled) {
  providers.push(
    Google({
      clientId: googleOAuth.clientId!,
      clientSecret: googleOAuth.clientSecret!,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

providers.push(
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;

      const email = parsed.data.email.toLowerCase();
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user?.password) return null;

      const isValid = await bcrypt.compare(
        parsed.data.password,
        user.password,
      );
      if (!isValid) return null;

      if (!user.emailVerified) {
        throw new UnverifiedEmailError();
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
);

export const isGoogleAuthEnabled = googleOAuth.enabled;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: authSecret,
  trustHost: true,
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers,
  events: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
      if (user.id && account?.provider) {
        await trackServerEvent(ANALYTICS_EVENTS.USER_LOGGED_IN, {
          userId: user.id,
          properties: { source: account.provider },
        });
      }
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      if (user?.id) {
        token.id = user.id;
        token.sub = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "USER";
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id ?? token.sub) as string;
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
});
