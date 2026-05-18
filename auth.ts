import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { Adapter } from "next-auth/adapters";
import type { Provider } from "next-auth/providers";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

const googleClientId = process.env.AUTH_GOOGLE_ID?.trim();
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET?.trim();

const providers: Provider[] = [];

if (googleClientId && googleClientSecret) {
  providers.push(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: true,
    }),
  );
} else if (process.env.NODE_ENV === "development") {
  console.warn(
    "[auth] Google OAuth disabled: set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in .env",
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

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
);

export const isGoogleAuthEnabled = providers.some((p) => {
  const provider = typeof p === "function" ? p() : p;
  return provider.id === "google";
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.sub = user.id;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id ?? token.sub) as string;
      }
      return session;
    },
  },
});
