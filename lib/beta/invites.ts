import "server-only";

import { getBetaCreditsBonus } from "@/lib/beta/config";
import {
  generateInviteCode,
  normalizeInviteCode,
  type InviteValidationResult,
} from "@/lib/beta/invite-code";
import { prisma } from "@/lib/prisma";

export async function validateInviteCode(
  rawCode: string,
  email?: string,
): Promise<InviteValidationResult> {
  const code = normalizeInviteCode(rawCode);
  if (!code) return { ok: false, reason: "Invite code required" };

  const invite = await prisma.inviteCode.findUnique({ where: { code } });
  if (!invite) return { ok: false, reason: "Invalid invite code" };
  if (invite.revokedAt) return { ok: false, reason: "This invite has been revoked" };
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return { ok: false, reason: "This invite has expired" };
  }
  if (invite.useCount >= invite.maxUses) {
    return { ok: false, reason: "This invite has already been used" };
  }
  if (invite.email && email) {
    const normalized = email.toLowerCase().trim();
    if (invite.email.toLowerCase() !== normalized) {
      return { ok: false, reason: "This invite is reserved for another email" };
    }
  }

  return { ok: true, inviteId: invite.id, code: invite.code };
}

export async function redeemInviteCode(params: {
  inviteId: string;
  userId: string;
  email: string;
}): Promise<void> {
  const bonus = getBetaCreditsBonus();

  await prisma.$transaction(async (tx) => {
    const invite = await tx.inviteCode.findUnique({
      where: { id: params.inviteId },
    });
    if (!invite || invite.revokedAt) throw new Error("INVITE_INVALID");
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new Error("INVITE_EXPIRED");
    }
    if (invite.useCount >= invite.maxUses) throw new Error("INVITE_USED");

    const updated = await tx.inviteCode.updateMany({
      where: {
        id: params.inviteId,
        useCount: { lt: invite.maxUses },
        revokedAt: null,
      },
      data: { useCount: { increment: 1 } },
    });
    if (updated.count === 0) throw new Error("INVITE_USED");

    await tx.user.update({
      where: { id: params.userId },
      data: {
        isBetaMember: true,
        betaJoinedAt: new Date(),
        inviteCodeUsed: invite.code,
        credits: { increment: bonus },
      },
    });

    await tx.waitlistEntry.updateMany({
      where: { email: params.email.toLowerCase() },
      data: {
        status: "joined",
        joinedAt: new Date(),
        userId: params.userId,
        inviteCodeId: params.inviteId,
      },
    });

    await tx.creditTransaction.create({
      data: {
        userId: params.userId,
        type: "ADD",
        amount: bonus,
        reason: "Beta explorer welcome credits",
      },
    });
  });
}

export async function createInviteCode(params: {
  email?: string;
  note?: string;
  maxUses?: number;
  expiresInDays?: number;
}): Promise<{ code: string; id: string }> {
  let code = generateInviteCode();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.inviteCode.findUnique({ where: { code } });
    if (!exists) break;
    code = generateInviteCode();
  }

  const expiresAt = params.expiresInDays
    ? new Date(Date.now() + params.expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const invite = await prisma.inviteCode.create({
    data: {
      code,
      email: params.email?.toLowerCase().trim(),
      note: params.note,
      maxUses: params.maxUses ?? 1,
      expiresAt,
    },
  });

  return { code: invite.code, id: invite.id };
}

export async function revokeInviteCode(inviteId: string): Promise<boolean> {
  const result = await prisma.inviteCode.updateMany({
    where: { id: inviteId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count > 0;
}

export async function approveWaitlistAndInvite(
  waitlistId: string,
  expiresInDays = 14,
): Promise<{ code: string; email: string } | null> {
  const entry = await prisma.waitlistEntry.findUnique({
    where: { id: waitlistId },
  });
  if (!entry || entry.status === "joined") return null;

  const { code, id } = await createInviteCode({
    email: entry.email,
    note: `Waitlist approval ${entry.email}`,
    expiresInDays,
  });

  await prisma.waitlistEntry.update({
    where: { id: waitlistId },
    data: {
      status: "invited",
      invitedAt: new Date(),
      inviteCodeId: id,
    },
  });

  return { code, email: entry.email };
}
