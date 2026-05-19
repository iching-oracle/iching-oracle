export type ReadingListItem = {
  id: string;
  question: string;
  hexagram: number;
  changing: string | null;
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
