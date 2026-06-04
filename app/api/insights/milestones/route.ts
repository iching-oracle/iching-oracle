import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolveValidUserId } from "@/lib/auth/session-user";
import {
  createOracleMilestone,
  deleteOracleMilestone,
  listOracleMilestones,
} from "@/lib/insights/milestones";
import type { CreateMilestoneInput } from "@/types/insights";

export async function GET() {
  const session = await auth();
  const userId = await resolveValidUserId(session?.user?.id);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const milestones = await listOracleMilestones(userId);
  return NextResponse.json({ milestones });
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = await resolveValidUserId(session?.user?.id);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateMilestoneInput;
  try {
    body = (await request.json()) as CreateMilestoneInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const milestone = await createOracleMilestone(userId, body);
    return NextResponse.json({ milestone }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unable to save milestone";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  const userId = await resolveValidUserId(session?.user?.id);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const ok = await deleteOracleMilestone(userId, id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
