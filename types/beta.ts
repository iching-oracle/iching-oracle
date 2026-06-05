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
  totalWaitlist: number;
  waitlistJoined: number;
  feedbackCount30d: number;
  avgFeedbackRating: number | null;
  inviteCodesActive: number;
  inviteRedemptions: number;
  waitlistConversionPct: number;
};

export type BetaAdminSignupRow = {
  id: string;
  email: string;
  name: string | null;
  isBetaMember: boolean;
  createdAt: string;
};

export type BetaAdminFeedbackRow = {
  id: string;
  type: string;
  message: string;
  rating: number | null;
  severity: string | null;
  createdAt: string;
  userEmail: string | null;
};

export type BetaAdminInviteRow = {
  id: string;
  code: string;
  email: string | null;
  note: string | null;
  source: string | null;
  maxUses: number;
  usedCount: number;
  remaining: number;
  isActive: boolean;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};
