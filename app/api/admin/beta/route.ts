import { NextResponse } from "next/server";
import {
  adminApproveWaitlist,
  adminCreateAnnouncement,
  adminCreateInvite,
  adminCreateSharedInvite,
  adminReactivateInvite,
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
        source: body.source,
        expiresInDays: body.expiresInDays,
      });
      return NextResponse.json({ ok: true, ...invite });
    }

    if (action === "create_shared_invite") {
      try {
        const invite = await adminCreateSharedInvite({
          code: body.code,
          maxUses: Number(body.maxUses),
          source: body.source,
          note: body.note,
          expiresAt: body.expiresAt ?? null,
        });
        return NextResponse.json({ ok: true, ...invite });
      } catch (err) {
        const message =
          err instanceof Error && err.message === "INVITE_CODE_EXISTS"
            ? "That invite code already exists."
            : err instanceof Error && err.message === "INVALID_INVITE_CODE_FORMAT"
              ? "Code must be 4–32 characters (letters, numbers, hyphens)."
              : "Could not create invite code.";
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    if (action === "revoke_invite") {
      const ok = await adminRevokeInvite(body.inviteId);
      return NextResponse.json({ ok });
    }

    if (action === "reactivate_invite") {
      const ok = await adminReactivateInvite(body.inviteId);
      if (!ok) {
        return NextResponse.json(
          { error: "Could not reactivate — code may be expired or missing." },
          { status: 400 },
        );
      }
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
