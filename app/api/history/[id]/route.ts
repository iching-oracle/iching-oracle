import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  deleteReadingForUser,
  getReadingForHistoryDetail,
} from "@/lib/readings/history";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const record = await getReadingForHistoryDetail(session.user.id, id);

  if (!record) {
    return NextResponse.json({ error: "Reading not found" }, { status: 404 });
  }

  return NextResponse.json({
    reading: {
      id: record.id,
      question: record.question,
      hexagram: record.hexagram,
      transformedHexagram: record.transformedHexagram,
      changingLines: record.changingLines,
      interpretation: record.interpretation,
      notes: record.notes,
      isFavorite: record.isFavorite,
      createdAt: record.createdAt,
      interpretationMode: record.interpretationMode,
      interpretationPending: record.interpretationPending,
      isPremiumReading: record.isPremiumReading,
      language: record.language,
    },
    journal: record.history,
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteReadingForUser(session.user.id, id);

  if (!deleted) {
    return NextResponse.json({ error: "Reading not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
