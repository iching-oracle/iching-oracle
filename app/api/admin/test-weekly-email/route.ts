import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminApiSession } from "@/lib/admin/auth";
import { sendWeeklyOracleEmail } from "@/lib/email/lifecycle/weekly-oracle-email";
import { handleRouteError } from "@/lib/errors/api";

const emailQuerySchema = z.string().email();

function unauthorized() {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 },
  );
}

export async function POST(request: Request) {
  try {
    const session = await getAdminApiSession();
    if (!session?.user?.id) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const emailOverride = searchParams.get("email")?.trim();

    let toEmail: string | undefined;
    if (emailOverride) {
      const parsed = emailQuerySchema.safeParse(emailOverride);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: "Invalid email address" },
          { status: 400 },
        );
      }
      toEmail = parsed.data.toLowerCase();
    }

    const result = await sendWeeklyOracleEmail(session.user.id, {
      test: true,
      toEmail,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result.reason,
          hexagram: result.oracle?.title,
        },
        { status: 500 },
      );
    }

    const sentTo = toEmail ?? session.user.email ?? "";

    return NextResponse.json({
      success: true,
      email: sentTo,
      hexagram: `Hexagram ${result.oracle.hexagramNumber}`,
      message: "Weekly email sent",
    });
  } catch (error) {
    return handleRouteError(error, {
      category: "admin_test_weekly_email",
      path: "/api/admin/test-weekly-email",
    });
  }
}
