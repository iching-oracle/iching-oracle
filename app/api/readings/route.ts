import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { queryReadingsForUser } from "@/lib/readings/journal";
import { saveReadingForUser } from "@/lib/readings/save-reading";
import { SUBSCRIPTION_ERROR_CODES } from "@/types/subscription";
import { isInterpretationMode } from "@/lib/interpretation/modes";
import { isReadingCategory } from "@/lib/readings/category";
import { createReadingSchema } from "@/lib/validations/reading";
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
  const favoriteParam = searchParams.get("favorite");

  const categoryParam = searchParams.get("category") ?? "";
  const modeParam = searchParams.get("mode") ?? "";

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

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createReadingSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "Invalid question";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const reading = await saveReadingForUser(
      session.user.id,
      parsed.data.question,
    );

    return NextResponse.json({ reading }, { status: 201 });
  } catch (error) {
    console.error("[readings POST]", error);
    const message =
      error instanceof Error ? error.message : "Failed to create reading";
    const isLimit = message.includes("readings per day");
    return NextResponse.json(
      {
        error: message,
        code: isLimit ? SUBSCRIPTION_ERROR_CODES.DAILY_LIMIT : undefined,
      },
      { status: isLimit ? 403 : 500 },
    );
  }
}
