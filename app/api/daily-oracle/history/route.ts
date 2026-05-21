import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDailyOracleHistory } from "@/lib/daily-oracle/service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const history = await getDailyOracleHistory(session.user.id, 60);
  return NextResponse.json({ history });
}
