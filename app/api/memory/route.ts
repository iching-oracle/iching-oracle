import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listMemoriesForUser } from "@/lib/memory/list";
import { getMemorySettings } from "@/lib/memory/settings";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [memories, settings] = await Promise.all([
    listMemoriesForUser(session.user.id),
    getMemorySettings(session.user.id),
  ]);

  return NextResponse.json({ memories, settings });
}
