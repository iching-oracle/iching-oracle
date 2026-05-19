import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveReadingForUser } from "@/lib/readings/save-reading";
import { prisma } from "@/lib/prisma";
import { createReadingSchema } from "@/lib/validations/reading";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const readings = await prisma.reading.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      question: true,
      hexagram: true,
      changingLines: true,
      transformedHexagram: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ readings });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createReadingSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "Invalid question";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const reading = await saveReadingForUser(
      session.user.id,
      parsed.data.question,
    );

    return NextResponse.json({ reading }, { status: 201 });
  } catch (error) {
    console.error("[readings POST]", error);
    return NextResponse.json(
      { error: "Failed to create reading" },
      { status: 500 },
    );
  }
}
