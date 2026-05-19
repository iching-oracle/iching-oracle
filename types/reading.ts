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
};

export type DashboardData = {
  user: DashboardUser;
  readings: ReadingListItem[];
};
