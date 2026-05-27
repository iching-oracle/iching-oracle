import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getHexagram } from "@/lib/hexagrams";
import { parseLineValues } from "@/lib/iching";
import { extractReadingSummary } from "@/lib/readings/summary";
import { saveReadingForUser } from "@/lib/readings/save-reading";
import { hasPremiumAccess } from "@/lib/premium";
import { createReadingSchema } from "@/lib/validations/reading";
import { prisma } from "@/lib/prisma";
import type { GuidedReadingResult } from "@/types/guided-reading";
import { CREDIT_ERROR_CODES } from "@/types/credits";

export async function POST(request: Request) {
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

  const parsed = createReadingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid question" },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        premiumUntil: true,
        subscriptionStatus: true,
        subscriptionCurrentPeriodEnd: true,
      },
    });

    const reading = await saveReadingForUser(
      session.user.id,
      parsed.data.question,
    );

    const primary = getHexagram(reading.hexagram);
    const transformed = reading.transformedHexagram
      ? getHexagram(reading.transformedHexagram)
      : null;

    const lineValues = parseLineValues(reading.lineValues);
    const quote =
      reading.summary?.trim() ||
      extractReadingSummary(reading.interpretation);

    const payload: GuidedReadingResult = {
      readingId: reading.id,
      question: reading.question,
      lineValues,
      hexagram: reading.hexagram,
      transformedHexagram: reading.transformedHexagram,
      primaryTitle: reading.primaryHexagramName ?? primary.title,
      chineseName: primary.chineseName,
      judgment: primary.judgment,
      finalTitle: reading.finalHexagramName ?? transformed?.title ?? null,
      interpretation: reading.interpretation,
      isPremium: hasPremiumAccess(user),
      interpretationPending: reading.interpretationPending,
      quote,
      category: reading.category as GuidedReadingResult["category"],
    };

    revalidatePath("/dashboard");
    revalidatePath("/history");

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[api/readings/guided]", error);
    const message =
      error instanceof Error ? error.message : "Could not complete reading.";
    const isCredits =
      message.includes("credits") ||
      message.includes("Premium") ||
      message.includes("readings per day");

    return NextResponse.json(
      {
        error: message,
        code: isCredits ? CREDIT_ERROR_CODES.INSUFFICIENT : undefined,
      },
      { status: isCredits ? 403 : 500 },
    );
  }
}
