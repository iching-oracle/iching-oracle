import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { toggleReadingFavorite } from "@/lib/readings/journal";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await toggleReadingFavorite(session.user.id, id);

  if (!result) {
    return NextResponse.json({ error: "Reading not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
