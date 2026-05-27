import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { logSystemEvent } from "@/lib/monitoring/logger";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  email: z.string().email().max(254),
  name: z.string().max(120).optional(),
  category: z.enum([
    "general",
    "billing",
    "refund",
    "technical",
    "feedback",
    "privacy",
  ]),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(5000),
});

export async function POST(request: Request) {
  const session = await auth();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  try {
    await prisma.supportTicket.create({
      data: {
        userId: session?.user?.id,
        email: parsed.data.email.toLowerCase().trim(),
        name: parsed.data.name?.trim(),
        category: parsed.data.category,
        subject: parsed.data.subject.trim(),
        message: parsed.data.message.trim(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    await logSystemEvent({
      level: "error",
      category: "support",
      message: "Support ticket creation failed",
      metadata: { error: String(error) },
    });
    return NextResponse.json(
      { error: "Could not submit ticket" },
      { status: 500 },
    );
  }
}
