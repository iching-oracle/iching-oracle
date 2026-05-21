import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isInterpretationMode } from "@/lib/interpretation/modes";
import { isReadingCategory } from "@/lib/readings/category";
import { queryReadingsForUser } from "@/lib/readings/journal";
import type {
  ReadingHistoryPeriod,
  ReadingJournalQuery,
} from "@/types/reading-journal";

function parsePeriod(value: string | null): ReadingHistoryPeriod {
  if (
    value === "favorites" ||
    value === "week" ||
    value === "month" ||
    value === "all"
  ) {
    return value;
  }
  return "all";
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const categoryParam = searchParams.get("category") ?? "";
  const modeParam = searchParams.get("mode") ?? "";
  const favoriteParam = searchParams.get("favorite");

  const query: ReadingJournalQuery = {
    q: searchParams.get("q") ?? undefined,
    category: isReadingCategory(categoryParam) ? categoryParam : "all",
    mode: isInterpretationMode(modeParam) ? modeParam : "all",
    period: parsePeriod(searchParams.get("period")),
    favorite: favoriteParam === "true" ? true : undefined,
    sort: searchParams.get("sort") === "asc" ? "asc" : "desc",
    page: Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1),
    pageSize: Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("pageSize") ?? "12", 10) || 12),
    ),
  };

  if (query.period === "all" && query.favorite) {
    query.period = "favorites";
  }

  const result = await queryReadingsForUser(session.user.id, query);
  return NextResponse.json(result);
}
