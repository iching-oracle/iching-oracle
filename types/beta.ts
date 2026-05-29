export type WaitlistStatus = "pending" | "invited" | "joined";

export type ReadingResonance = "deeply" | "somewhat" | "not_really";

export type ProductFeedbackType = "bug" | "feature" | "ux" | "general";

export type BetaAnnouncementType =
  | "update"
  | "maintenance"
  | "feature"
  | "founder";

export type BetaProfileDTO = {
  isBetaMember: boolean;
  betaJoinedAt: string | null;
  dailyStreak: number;
  totalReadings: number;
  feedbackCount: number;
  inviteCodeUsed: string | null;
};

export type BetaAnnouncementDTO = {
  id: string;
  title: string;
  body: string;
  type: BetaAnnouncementType;
  isPinned: boolean;
  publishedAt: string;
};

export type BetaInsightsDTO = {
  resonanceScore: number;
  deeplyCount: number;
  somewhatCount: number;
  notReallyCount: number;
  onboardingCompletionPct: number;
  betaRetentionPct: number;
  topFeatureRequests: Array<{ message: string; count: number }>;
  bugCount: number;
  waitlistPending: number;
  waitlistInvited: number;
  betaMembers: number;
};
