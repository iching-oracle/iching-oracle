import { NextResponse } from "next/server";
import { z } from "zod";
import { trackSeoEvent } from "@/lib/seo/analytics";

const bodySchema = z.object({
  path: z.string().min(1).max(500),
  event: z
    .enum(["page_view", "share", "cta_click", "reading_start"])
    .default("page_view"),
  source: z.string().max(120).optional(),
  keyword: z.string().max(120).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await trackSeoEvent(parsed.data);
  return NextResponse.json({ ok: true });
}
