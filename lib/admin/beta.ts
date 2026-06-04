import "server-only";

import { requireAdminSession } from "@/lib/admin/auth";
import {
  approveWaitlistAndInvite,
  createInviteCode,
  revokeInviteCode,
} from "@/lib/beta/invites";
import { sendBetaInviteEmail } from "@/lib/beta/emails";
import { prisma } from "@/lib/prisma";

export async function getAdminWaitlist(limit = 100) {
  return prisma.waitlistEntry.findMany({
    orderBy: { createdAt: "asc" },
    take: limit,
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      source: true,
      referrer: true,
      waitlistPosition: true,
      invitedAt: true,
      joinedAt: true,
      createdAt: true,
    },
  });
}

export async function getAdminInvites(limit = 50) {
  return prisma.inviteCode.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAdminRecentSignups(limit = 8) {
  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      email: true,
      name: true,
      isBetaMember: true,
      createdAt: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    isBetaMember: r.isBetaMember,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getAdminRecentFeedback(limit = 12) {
  const rows = await prisma.productFeedback.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      type: true,
      message: true,
      rating: true,
      severity: true,
      createdAt: true,
      user: { select: { email: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    message: r.message.slice(0, 200),
    rating: r.rating,
    severity: r.severity,
    createdAt: r.createdAt.toISOString(),
    userEmail: r.user?.email ?? null,
  }));
}

export async function adminApproveWaitlist(waitlistId: string) {
  await requireAdminSession();
  const result = await approveWaitlistAndInvite(waitlistId);
  if (!result) return null;
  const entry = await prisma.waitlistEntry.findUnique({
    where: { id: waitlistId },
    select: { name: true },
  });
  void sendBetaInviteEmail(result.email, result.code, entry?.name ?? undefined);
  return result;
}

export async function adminCreateInvite(params: {
  email?: string;
  note?: string;
  expiresInDays?: number;
}) {
  await requireAdminSession();
  const invite = await createInviteCode(params);
  if (params.email) {
    void sendBetaInviteEmail(params.email, invite.code);
  }
  return invite;
}

export async function adminRevokeInvite(inviteId: string) {
  await requireAdminSession();
  return revokeInviteCode(inviteId);
}

export async function adminCreateAnnouncement(params: {
  title: string;
  body: string;
  type?: string;
  isPinned?: boolean;
}) {
  await requireAdminSession();
  return prisma.betaAnnouncement.create({
    data: {
      title: params.title.trim(),
      body: params.body.trim(),
      type: params.type ?? "update",
      isPinned: params.isPinned ?? false,
    },
  });
}
