import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getMemorySettings,
  setMemoryEnabled,
} from "@/lib/memory/settings";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getMemorySettings(session.user.id);
  return NextResponse.json(settings);
}

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

  const enabled = Boolean(
    (body as { memoryEnabled?: boolean }).memoryEnabled,
  );

  await setMemoryEnabled(session.user.id, enabled);
  const settings = await getMemorySettings(session.user.id);

  return NextResponse.json(settings);
}
