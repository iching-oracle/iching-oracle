import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { guardAiRoute } from "@/lib/api/route-guard";
import { RATE_LIMITS } from "@/lib/rate-limit/presets";
import { extractMemoriesForUser } from "@/lib/memory/extract";
import { isMemoryEnabledForUser } from "@/lib/memory/settings";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const guarded = await guardAiRoute({
    request,
    scope: "memory-extract",
    userId: session.user.id,
    role: session.user.role,
    ai: true,
    ipPreset: RATE_LIMITS.publicApi,
  });
  if (guarded) return guarded;

  if (!(await isMemoryEnabledForUser(session.user.id))) {
    return NextResponse.json(
      { error: "Memory system is disabled" },
      { status: 403 },
    );
  }

  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "Extraction unavailable" },
      { status: 503 },
    );
  }

  const result = await extractMemoriesForUser(
    session.user.id,
    "manual",
  );

  return NextResponse.json(result);
}
