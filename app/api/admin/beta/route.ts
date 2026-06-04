import { NextResponse } from "next/server";
import {
  adminApproveWaitlist,
  adminCreateAnnouncement,
  adminCreateInvite,
  adminRevokeInvite,
  getAdminInvites,
  getAdminRecentFeedback,
  getAdminRecentSignups,
  getAdminWaitlist,
} from "@/lib/admin/beta";
import { requireAdminSession } from "@/lib/admin/auth";
import { getBetaInsights } from "@/lib/beta/insights";
import { handleRouteError } from "@/lib/errors/api";

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") ?? "overview";

    if (view === "waitlist") {
      const waitlist = await getAdminWaitlist();
      return NextResponse.json({ waitlist });
    }
    if (view === "invites") {
      const invites = await getAdminInvites();
      return NextResponse.json({ invites });
    }

    const [insights, recentSignups, recentFeedback] = await Promise.all([
      getBetaInsights(),
      getAdminRecentSignups(),
      getAdminRecentFeedback(),
    ]);
    return NextResponse.json({ insights, recentSignups, recentFeedback });
  } catch (error) {
    return handleRouteError(error, { category: "admin_beta", path: "/api/admin/beta" });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const action = body.action as string;

    if (action === "approve_waitlist") {
      const result = await adminApproveWaitlist(body.waitlistId);
      if (!result) {
        return NextResponse.json({ error: "Could not approve" }, { status: 400 });
      }
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "create_invite") {
      const invite = await adminCreateInvite({
        email: body.email,
        note: body.note,
        expiresInDays: body.expiresInDays,
      });
      return NextResponse.json({ ok: true, ...invite });
    }

    if (action === "revoke_invite") {
      const ok = await adminRevokeInvite(body.inviteId);
      return NextResponse.json({ ok });
    }

    if (action === "create_announcement") {
      const row = await adminCreateAnnouncement({
        title: body.title,
        body: body.body,
        type: body.type,
        isPinned: body.isPinned,
      });
      return NextResponse.json({ ok: true, id: row.id });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return handleRouteError(error, { category: "admin_beta", path: "/api/admin/beta" });
  }
}
