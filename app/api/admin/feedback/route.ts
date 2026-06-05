import { NextResponse } from "next/server";
import { getAdminFeedbackPage } from "@/lib/admin/feedback";
import { requireAdminSession } from "@/lib/admin/auth";
import { handleRouteError } from "@/lib/errors/api";

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const data = await getAdminFeedbackPage({
      category: searchParams.get("category") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      page: searchParams.get("page") ?? undefined,
    });
    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error, {
      category: "admin_feedback",
      path: "/api/admin/feedback",
    });
  }
}
