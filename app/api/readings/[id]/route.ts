import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const reading = await prisma.reading.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!reading) {
    return NextResponse.json({ error: "Reading not found" }, { status: 404 });
  }

  return NextResponse.json({ reading });
}
