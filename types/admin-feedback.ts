import type { ProductFeedbackType } from "@/types/beta";

export type FeedbackFilterCategory =
  | "all"
  | "bug"
  | "feature"
  | "general"
  | "emotional";

export type FeedbackSort = "newest" | "rating_asc" | "rating_desc";

export type AdminFeedbackRow = {
  id: string;
  type: ProductFeedbackType | string;
  message: string;
  rating: number | null;
  severity: string | null;
  flow: string | null;
  pagePath: string | null;
  createdAt: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
};

export type RatingBucket = {
  rating: number;
  count: number;
};

export type AdminFeedbackSummary = {
  totalCount: number;
  averageRating: number | null;
  topCategory: string | null;
  latestSubmissionAt: string | null;
  ratingDistribution: RatingBucket[];
};

export type AdminFeedbackPageData = {
  items: AdminFeedbackRow[];
  summary: AdminFeedbackSummary;
  page: number;
  pageSize: number;
  totalPages: number;
  totalMatching: number;
  category: FeedbackFilterCategory;
  sort: FeedbackSort;
};
