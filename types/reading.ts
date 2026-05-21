export type ReadingListItem = {
  id: string;
  question: string;
  hexagram: number;
  changingLines: string | null;
  transformedHexagram: number | null;
  createdAt: Date;
};

export type DashboardUser = {
  id: string;
  name: string | null;
  email: string;
  premiumUntil: Date | null;
  subscriptionStatus: string;
  subscriptionCurrentPeriodEnd: Date | null;
  stripeCustomerId: string | null;
};

export type DashboardData = {
  user: DashboardUser;
  readings: ReadingListItem[];
};
