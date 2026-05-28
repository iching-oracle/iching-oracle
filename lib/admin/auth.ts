import "server-only";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAdminEmailsFromEnv } from "@/lib/admin/edge-admin";
import { prisma } from "@/lib/prisma";

/** Comma-separated allowlist from ADMIN_EMAILS env. */
export function getAdminEmails(): string[] {
  return getAdminEmailsFromEnv();
}

export async function isAdminUser(userId: string, email?: string | null): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true },
  });

  if (!user) return false;
  if (user.role === "ADMIN") return true;

  const allowlist = getAdminEmails();
  const normalized = (email ?? user.email).toLowerCase();
  return allowlist.includes(normalized);
}

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  const ok = await isAdminUser(session.user.id, session.user.email);
  if (!ok) {
    redirect("/dashboard");
  }

  return session;
}
