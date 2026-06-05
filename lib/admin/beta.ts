import "server-only";

import { requireAdminSession } from "@/lib/admin/auth";
import {
  approveWaitlistAndInvite,
  createInviteCode,
  reactivateInviteCode,
  revokeInviteCode,
} from "@/lib/beta/invites";
import { sendBetaInviteEmail } from "@/lib/beta/emails";
import { prisma } from "@/lib/prisma";
import type { BetaAdminInviteRow } from "@/types/beta";

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

export async function getAdminInvites(limit = 100): Promise<BetaAdminInviteRow[]> {
  const rows = await prisma.inviteCode.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    email: row.email,
    note: row.note,
    source: row.source,
    maxUses: row.maxUses,
    usedCount: row.usedCount,
    remaining: Math.max(0, row.maxUses - row.usedCount),
    isActive: row.isActive && row.revokedAt == null,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    revokedAt: row.revokedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
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
  source?: string;
  expiresInDays?: number;
}) {
  await requireAdminSession();
  const invite = await createInviteCode({
    ...params,
    source: params.source ?? "Admin",
    maxUses: 1,
  });
  if (params.email) {
    void sendBetaInviteEmail(params.email, invite.code);
  }
  return invite;
}

export async function adminCreateSharedInvite(params: {
  code: string;
  maxUses: number;
  source?: string;
  note?: string;
  expiresAt?: string | null;
}) {
  await requireAdminSession();
  return createInviteCode({
    code: params.code,
    maxUses: params.maxUses,
    source: params.source,
    note: params.note,
    expiresAt: params.expiresAt ? new Date(params.expiresAt) : null,
  });
}

export async function adminRevokeInvite(inviteId: string) {
  await requireAdminSession();
  return revokeInviteCode(inviteId);
}

export async function adminReactivateInvite(inviteId: string) {
  await requireAdminSession();
  return reactivateInviteCode(inviteId);
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
