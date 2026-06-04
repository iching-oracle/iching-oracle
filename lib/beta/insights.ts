import "server-only";

import { prisma } from "@/lib/prisma";
import type { BetaInsightsDTO } from "@/types/beta";

export async function getBetaInsights(): Promise<BetaInsightsDTO> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    deeplyCount,
    somewhatCount,
    notReallyCount,
    bugCount,
    waitlistPending,
    waitlistInvited,
    waitlistJoined,
    totalWaitlist,
    betaMembers,
    signupCount,
    onboardingCompleted,
    betaUsersActive,
    featureRequests,
    feedbackCount30d,
    ratingAgg,
    invitesActive,
    inviteRedemptions,
  ] = await Promise.all([
    prisma.readingFeedback.count({ where: { resonance: "deeply" } }),
    prisma.readingFeedback.count({ where: { resonance: "somewhat" } }),
    prisma.readingFeedback.count({ where: { resonance: "not_really" } }),
    prisma.productFeedback.count({ where: { type: "bug" } }),
    prisma.waitlistEntry.count({ where: { status: "pending" } }),
    prisma.waitlistEntry.count({ where: { status: "invited" } }),
    prisma.waitlistEntry.count({ where: { status: "joined" } }),
    prisma.waitlistEntry.count(),
    prisma.user.count({ where: { isBetaMember: true } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.productAnalyticsEvent.count({
      where: {
        event: "onboarding_completed",
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.user.count({
      where: {
        isBetaMember: true,
        lastActivityAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.productFeedback.groupBy({
      by: ["message"],
      where: { type: "feature" },
      _count: true,
      orderBy: { _count: { message: "desc" } },
      take: 8,
    }),
    prisma.productFeedback.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.productFeedback.aggregate({
      _avg: { rating: true },
      where: { rating: { not: null }, createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.inviteCode.count({
      where: {
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    }),
    prisma.inviteCode.aggregate({ _sum: { useCount: true } }),
  ]);

  const totalResonance = deeplyCount + somewhatCount + notReallyCount;
  const resonanceScore =
    totalResonance > 0
      ? Math.round((deeplyCount * 100 + somewhatCount * 50) / totalResonance)
      : 0;

  const onboardingCompletionPct =
    signupCount > 0 ? Math.round((onboardingCompleted / signupCount) * 100) : 0;

  const betaRetentionPct =
    betaMembers > 0 ? Math.round((betaUsersActive / betaMembers) * 100) : 0;

  const waitlistConversionPct =
    totalWaitlist > 0 ? Math.round((waitlistJoined / totalWaitlist) * 100) : 0;

  const avgRating = ratingAgg._avg.rating;

  return {
    resonanceScore,
    deeplyCount,
    somewhatCount,
    notReallyCount,
    onboardingCompletionPct,
    betaRetentionPct,
    topFeatureRequests: featureRequests.map((f) => ({
      message: f.message.slice(0, 120),
      count: f._count,
    })),
    bugCount,
    waitlistPending,
    waitlistInvited,
    betaMembers,
    totalWaitlist,
    waitlistJoined,
    feedbackCount30d,
    avgFeedbackRating:
      avgRating != null ? Math.round(avgRating * 10) / 10 : null,
    inviteCodesActive: invitesActive,
    inviteRedemptions: inviteRedemptions._sum.useCount ?? 0,
    waitlistConversionPct,
  };
}
