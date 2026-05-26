import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteMemory } from "@/lib/memory/list";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteMemory(session.user.id, id);

  if (!deleted) {
    return NextResponse.json({ error: "Memory not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
