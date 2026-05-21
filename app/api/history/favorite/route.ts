import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { toggleReadingFavorite } from "@/lib/readings/journal";

const bodySchema = z.object({
  readingId: z.string().min(1),
});

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

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reading id" }, { status: 400 });
  }

  const result = await toggleReadingFavorite(
    session.user.id,
    parsed.data.readingId,
  );

  if (!result) {
    return NextResponse.json({ error: "Reading not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
