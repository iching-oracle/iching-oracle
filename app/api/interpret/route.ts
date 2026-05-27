import { auth } from "@/auth";
import { buildOracleContextFromReading } from "@/lib/interpretation/context";
import { isInterpretationMode } from "@/lib/interpretation/modes";
import { streamAdvancedInterpretation } from "@/lib/interpretation/stream";
import { chargeCreditsForFeature } from "@/lib/credits/assert";
import { CREDIT_ERROR_CODES } from "@/types/credits";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  readingId: z.string().min(1),
  mode: z
    .enum(["traditional", "psychological", "spiritual", "direct"])
    .optional()
    .default("traditional"),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const creditCharge = await chargeCreditsForFeature(
    session.user.id,
    "deep_interpretation",
  );
  if (!creditCharge.ok) {
    const status =
      creditCharge.code === CREDIT_ERROR_CODES.RATE_LIMIT ? 429 : 403;
    return new Response(
      JSON.stringify({ error: creditCharge.message, code: creditCharge.code }),
      { status, headers: { "Content-Type": "application/json" } },
    );
  }

  const reading = await prisma.reading.findFirst({
    where: { id: parsed.data.readingId, userId: session.user.id },
  });

  if (!reading) {
    return new Response(JSON.stringify({ error: "Reading not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const mode = isInterpretationMode(parsed.data.mode)
    ? parsed.data.mode
    : "traditional";

  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    return new Response(
      JSON.stringify({ error: "AI service is not configured." }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const context = buildOracleContextFromReading(reading, mode);
    const stream = await streamAdvancedInterpretation(context);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Interpretation-Mode": mode,
      },
    });
  } catch (error) {
    console.error("[api/interpret]", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Interpretation stream failed.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
