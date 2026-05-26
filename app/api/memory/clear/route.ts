import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { clearAllMemories } from "@/lib/memory/list";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await clearAllMemories(session.user.id);
  return NextResponse.json({ cleared: count });
}
