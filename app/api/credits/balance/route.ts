import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCreditBalance } from "@/lib/credits/balance";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const balance = await getCreditBalance(session.user.id);
  if (!balance) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(balance);
}
