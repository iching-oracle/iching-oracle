import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { queryReadingsForUser } from "@/lib/readings/journal";
import { saveReadingForUser } from "@/lib/readings/save-reading";
import { isInterpretationMode } from "@/lib/interpretation/modes";
import { isReadingCategory } from "@/lib/readings/category";
import { createReadingSchema } from "@/lib/validations/reading";
import type { ReadingJournalQuery } from "@/types/reading-journal";

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
    favorite: favoriteParam === "true" ? true : undefined,
    sort: searchParams.get("sort") === "asc" ? "asc" : "desc",
    page: Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1),
    pageSize: Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("pageSize") ?? "12", 10) || 12),
    ),
  };

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
    return NextResponse.json(
      { error: "Failed to create reading" },
      { status: 500 },
    );
  }
}
