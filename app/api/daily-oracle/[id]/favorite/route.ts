import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { toggleDailyOracleFavorite } from "@/lib/daily-oracle/service";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await toggleDailyOracleFavorite(session.user.id, id);

  if (result === null) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ isFavorite: result });
}
