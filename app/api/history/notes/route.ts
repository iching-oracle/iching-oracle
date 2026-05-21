import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateReadingNotes } from "@/lib/readings/journal";
import { readingNotesSchema } from "@/lib/validations/reading-notes";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = readingNotesSchema.safeParse(body);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Invalid notes payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const result = await updateReadingNotes(
    session.user.id,
    parsed.data.readingId,
    parsed.data.notes,
  );

  if (!result) {
    return NextResponse.json({ error: "Reading not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
