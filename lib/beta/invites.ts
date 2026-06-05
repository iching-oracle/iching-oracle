import "server-only";

import type { InviteCode } from "@prisma/client";
import { getBetaCreditsBonus } from "@/lib/beta/config";
import {
  generateInviteCode,
  INVITE_ERROR_MESSAGES,
  isValidCustomInviteCode,
  normalizeInviteCode,
  type InviteValidationResult,
} from "@/lib/beta/invite-code";
import { prisma } from "@/lib/prisma";

function isInviteExpired(invite: Pick<InviteCode, "expiresAt">): boolean {
  return Boolean(invite.expiresAt && invite.expiresAt < new Date());
}

function isInviteInactive(invite: Pick<InviteCode, "isActive" | "revokedAt">): boolean {
  return !invite.isActive || invite.revokedAt != null;
}

function isInviteAtCapacity(invite: Pick<InviteCode, "usedCount" | "maxUses">): boolean {
  return invite.usedCount >= invite.maxUses;
}

function remainingSlots(invite: Pick<InviteCode, "usedCount" | "maxUses">): number {
  return Math.max(0, invite.maxUses - invite.usedCount);
}

export async function validateInviteCode(
  rawCode: string,
  email?: string,
): Promise<InviteValidationResult> {
  const code = normalizeInviteCode(rawCode);
  if (!code) {
    return { ok: false, reason: INVITE_ERROR_MESSAGES.INVALID };
  }

  const invite = await prisma.inviteCode.findUnique({ where: { code } });
  if (!invite) {
    return { ok: false, reason: INVITE_ERROR_MESSAGES.INVALID };
  }
  if (isInviteInactive(invite)) {
    return { ok: false, reason: INVITE_ERROR_MESSAGES.REVOKED };
  }
  if (isInviteExpired(invite)) {
    return { ok: false, reason: INVITE_ERROR_MESSAGES.EXPIRED };
  }
  if (isInviteAtCapacity(invite)) {
    return { ok: false, reason: INVITE_ERROR_MESSAGES.CAPACITY };
  }
  if (invite.email && email) {
    const normalized = email.toLowerCase().trim();
    if (invite.email.toLowerCase() !== normalized) {
      return { ok: false, reason: INVITE_ERROR_MESSAGES.EMAIL_MISMATCH };
    }
  }

  return {
    ok: true,
    inviteId: invite.id,
    code: invite.code,
    remaining: remainingSlots(invite),
  };
}

export async function redeemInviteCode(params: {
  inviteId: string;
  userId: string;
  email: string;
}): Promise<void> {
  const bonus = getBetaCreditsBonus();
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const invite = await tx.inviteCode.findUnique({
      where: { id: params.inviteId },
    });
    if (!invite || isInviteInactive(invite)) {
      throw new Error("INVITE_INACTIVE");
    }
    if (isInviteExpired(invite)) {
      throw new Error("INVITE_EXPIRED");
    }
    if (isInviteAtCapacity(invite)) {
      throw new Error("INVITE_USED");
    }

    const updated = await tx.inviteCode.updateMany({
      where: {
        id: params.inviteId,
        isActive: true,
        revokedAt: null,
        usedCount: { lt: invite.maxUses },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      data: { usedCount: { increment: 1 } },
    });
    if (updated.count === 0) {
      throw new Error("INVITE_USED");
    }

    await tx.user.update({
      where: { id: params.userId },
      data: {
        isBetaMember: true,
        betaJoinedAt: now,
        inviteCodeUsed: invite.code,
        inviteCodeId: invite.id,
        credits: { increment: bonus },
      },
    });

    await tx.waitlistEntry.updateMany({
      where: { email: params.email.toLowerCase() },
      data: {
        status: "joined",
        joinedAt: now,
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
  code?: string;
  email?: string;
  note?: string;
  source?: string;
  maxUses?: number;
  expiresAt?: Date | null;
  expiresInDays?: number;
}): Promise<{ code: string; id: string }> {
  const maxUses = Math.max(1, Math.min(params.maxUses ?? 1, 10_000));

  let code = params.code
    ? normalizeInviteCode(params.code)
    : generateInviteCode();

  if (params.code && !isValidCustomInviteCode(code)) {
    throw new Error("INVALID_INVITE_CODE_FORMAT");
  }

  const existing = await prisma.inviteCode.findUnique({ where: { code } });
  if (existing) {
    throw new Error("INVITE_CODE_EXISTS");
  }

  if (!params.code) {
    for (let i = 0; i < 5; i++) {
      const collision = await prisma.inviteCode.findUnique({ where: { code } });
      if (!collision) break;
      code = generateInviteCode();
    }
  }

  const expiresAt =
    params.expiresAt !== undefined
      ? params.expiresAt
      : params.expiresInDays
        ? new Date(Date.now() + params.expiresInDays * 24 * 60 * 60 * 1000)
        : null;

  const invite = await prisma.inviteCode.create({
    data: {
      code,
      email: params.email?.toLowerCase().trim(),
      note: params.note,
      source: params.source?.trim() || null,
      maxUses,
      expiresAt,
    },
  });

  return { code: invite.code, id: invite.id };
}

export async function revokeInviteCode(inviteId: string): Promise<boolean> {
  const result = await prisma.inviteCode.updateMany({
    where: { id: inviteId, isActive: true },
    data: { isActive: false, revokedAt: new Date() },
  });
  return result.count > 0;
}

export async function reactivateInviteCode(inviteId: string): Promise<boolean> {
  const invite = await prisma.inviteCode.findUnique({ where: { id: inviteId } });
  if (!invite) return false;
  if (isInviteExpired(invite)) return false;

  const result = await prisma.inviteCode.updateMany({
    where: { id: inviteId, isActive: false },
    data: { isActive: true, revokedAt: null },
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
    source: "Waitlist",
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
