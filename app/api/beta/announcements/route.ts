import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.betaAnnouncement.findMany({
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
    take: 20,
  });

  return NextResponse.json({
    announcements: rows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      type: r.type,
      isPinned: r.isPinned,
      publishedAt: r.publishedAt.toISOString(),
    })),
  });
}
