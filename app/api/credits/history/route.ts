import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getTransactionHistory,
  getUsageHistory,
} from "@/lib/credits/history";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [usage, transactions] = await Promise.all([
    getUsageHistory(session.user.id, 30),
    getTransactionHistory(session.user.id, 30),
  ]);

  return NextResponse.json({ usage, transactions });
}
