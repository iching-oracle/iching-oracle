import { NextResponse } from "next/server";
import { z } from "zod";
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

const patchSchema = z.object({
  interpretation: z.string().min(1),
  interpretationMode: z
    .enum(["traditional", "psychological", "spiritual", "direct"])
    .optional(),
});

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.reading.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Reading not found" }, { status: 404 });
  }

  const reading = await prisma.reading.update({
    where: { id },
    data: {
      interpretation: parsed.data.interpretation,
      interpretationPending: false,
      isPremiumReading: true,
    },
  });

  return NextResponse.json({ reading });
}
