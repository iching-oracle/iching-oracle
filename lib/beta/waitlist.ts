import "server-only";

import { prisma } from "@/lib/prisma";
import { sendWaitlistConfirmationEmail } from "@/lib/beta/emails";

export async function joinWaitlist(params: {
  email: string;
  name?: string;
  source?: string;
  referrer?: string;
  referralCode?: string;
}): Promise<{ created: boolean; position: number }> {
  const email = params.email.toLowerCase().trim();

  const existing = await prisma.waitlistEntry.findUnique({ where: { email } });

  if (existing) {
    await prisma.waitlistEntry.update({
      where: { email },
      data: {
        name: params.name?.trim() || existing.name,
        source: params.source ?? existing.source,
        referrer: params.referrer ?? existing.referrer,
        referralCode: params.referralCode ?? existing.referralCode,
      },
    });
    return {
      created: false,
      position: existing.waitlistPosition ?? 0,
    };
  }

  const count = await prisma.waitlistEntry.count();
  const position = count + 1;

  await prisma.waitlistEntry.create({
    data: {
      email,
      name: params.name?.trim(),
      source: params.source,
      referrer: params.referrer,
      referralCode: params.referralCode,
      waitlistPosition: position,
      status: "pending",
    },
  });

  void sendWaitlistConfirmationEmail(email, params.name, position);

  return { created: true, position };
}

export async function getBetaProfile(userId: string) {
  const [user, readingCount, feedbackCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        isBetaMember: true,
        betaJoinedAt: true,
        dailyStreak: true,
        createdAt: true,
        inviteCodeUsed: true,
      },
    }),
    prisma.reading.count({ where: { userId } }),
    prisma.readingFeedback.count({ where: { userId } }),
  ]);

  if (!user) return null;

  return {
    isBetaMember: user.isBetaMember,
    betaJoinedAt: user.betaJoinedAt?.toISOString() ?? null,
    dailyStreak: user.dailyStreak,
    totalReadings: readingCount,
    feedbackCount,
    inviteCodeUsed: user.inviteCodeUsed,
  };
}
