import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  AdminFeedbackPageData,
  AdminFeedbackRow,
  AdminFeedbackSummary,
  FeedbackFilterCategory,
  FeedbackSort,
  RatingBucket,
} from "@/types/admin-feedback";

export const ADMIN_FEEDBACK_PAGE_SIZE = 20;

const VALID_CATEGORIES: FeedbackFilterCategory[] = [
  "all",
  "bug",
  "feature",
  "general",
  "emotional",
];

const VALID_SORTS: FeedbackSort[] = ["newest", "rating_asc", "rating_desc"];

export function parseFeedbackCategory(
  value: string | undefined,
): FeedbackFilterCategory {
  if (value && VALID_CATEGORIES.includes(value as FeedbackFilterCategory)) {
    return value as FeedbackFilterCategory;
  }
  return "all";
}

export function parseFeedbackSort(value: string | undefined): FeedbackSort {
  if (value && VALID_SORTS.includes(value as FeedbackSort)) {
    return value as FeedbackSort;
  }
  return "newest";
}

export function parseFeedbackPage(value: string | undefined): number {
  const n = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function categoryWhere(
  category: FeedbackFilterCategory,
): Prisma.ProductFeedbackWhereInput {
  if (category === "all") return {};
  if (category === "emotional") return { type: "ux" };
  return { type: category };
}

function sortOrderBy(sort: FeedbackSort): Prisma.ProductFeedbackOrderByWithRelationInput[] {
  switch (sort) {
    case "rating_asc":
      return [{ rating: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }];
    case "rating_desc":
      return [{ rating: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }];
    default:
      return [{ createdAt: "desc" }];
  }
}

function toRow(row: {
  id: string;
  type: string;
  message: string;
  rating: number | null;
  severity: string | null;
  flow: string | null;
  pagePath: string | null;
  createdAt: Date;
  userId: string | null;
  user: { email: string; name: string | null } | null;
}): AdminFeedbackRow {
  return {
    id: row.id,
    type: row.type,
    message: row.message,
    rating: row.rating,
    severity: row.severity,
    flow: row.flow,
    pagePath: row.pagePath,
    createdAt: row.createdAt.toISOString(),
    userId: row.userId,
    userEmail: row.user?.email ?? null,
    userName: row.user?.name ?? null,
  };
}

async function fetchSummary(
  where: Prisma.ProductFeedbackWhereInput,
): Promise<AdminFeedbackSummary> {
  const [totalCount, ratingAgg, typeGroups, latest, ratingGroups] =
    await Promise.all([
      prisma.productFeedback.count({ where }),
      prisma.productFeedback.aggregate({
        where: { ...where, rating: { not: null } },
        _avg: { rating: true },
      }),
      prisma.productFeedback.groupBy({
        by: ["type"],
        where,
        _count: { type: true },
        orderBy: { _count: { type: "desc" } },
        take: 1,
      }),
      prisma.productFeedback.findFirst({
        where,
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      prisma.productFeedback.groupBy({
        by: ["rating"],
        where: { ...where, rating: { not: null } },
        _count: { rating: true },
      }),
    ]);

  const ratingDistribution: RatingBucket[] = [1, 2, 3, 4, 5].map((rating) => {
    const hit = ratingGroups.find((g) => g.rating === rating);
    return { rating, count: hit?._count.rating ?? 0 };
  });

  return {
    totalCount,
    averageRating: ratingAgg._avg.rating
      ? Math.round(ratingAgg._avg.rating * 10) / 10
      : null,
    topCategory: typeGroups[0]?.type ?? null,
    latestSubmissionAt: latest?.createdAt.toISOString() ?? null,
    ratingDistribution,
  };
}

export async function getAdminFeedbackPage(params: {
  category?: string;
  sort?: string;
  page?: string;
}): Promise<AdminFeedbackPageData> {
  const category = parseFeedbackCategory(params.category);
  const sort = parseFeedbackSort(params.sort);
  const page = parseFeedbackPage(params.page);
  const where = categoryWhere(category);

  const totalMatching = await prisma.productFeedback.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalMatching / ADMIN_FEEDBACK_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const [rows, summary] = await Promise.all([
    prisma.productFeedback.findMany({
      where,
      orderBy: sortOrderBy(sort),
      skip: (safePage - 1) * ADMIN_FEEDBACK_PAGE_SIZE,
      take: ADMIN_FEEDBACK_PAGE_SIZE,
      select: {
        id: true,
        type: true,
        message: true,
        rating: true,
        severity: true,
        flow: true,
        pagePath: true,
        createdAt: true,
        userId: true,
        user: { select: { email: true, name: true } },
      },
    }),
    fetchSummary(where),
  ]);

  return {
    items: rows.map(toRow),
    summary,
    page: safePage,
    pageSize: ADMIN_FEEDBACK_PAGE_SIZE,
    totalPages,
    totalMatching,
    category,
    sort,
  };
}
