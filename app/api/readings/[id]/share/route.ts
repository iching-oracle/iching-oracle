import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server";
import { getAppUrl } from "@/lib/stripe";
import {
  enableReadingShare,
  setReadingShareEnabled,
} from "@/lib/share/service";
import { guardShareRoute } from "@/lib/api/route-guard";
import { apiUnauthorized } from "@/lib/errors/api";

type RouteParams = { params: Promise<{ id: string }> };

async function authorizeShare(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: apiUnauthorized() } as const;
  }

  const guarded = await guardShareRoute(
    request,
    session.user.id,
    session.user.role,
  );
  if (guarded) {
    return { error: guarded } as const;
  }

  return { session } as const;
}

/** Enable public sharing and return the share URL. */
export async function POST(request: Request, { params }: RouteParams) {
  const authResult = await authorizeShare(request);
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const result = await enableReadingShare(authResult.session.user.id, id);

  if (!result) {
    return NextResponse.json({ error: "Reading not found" }, { status: 404 });
  }

  await trackServerEvent(ANALYTICS_EVENTS.READING_SHARED, {
    userId: authResult.session.user.id,
    properties: {
      reading_id: id,
      share_id: result.shareId,
      source: "api_post",
    },
  });

  return NextResponse.json({ url: result.url });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const authResult = await authorizeShare(request);
  if ("error" in authResult) return authResult.error;

  let enable = false;
  try {
    const body = (await request.json()) as {
      enable?: boolean;
      isPublic?: boolean;
    };
    enable = Boolean(body.enable ?? body.isPublic);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { id } = await params;
  const result = await setReadingShareEnabled(
    authResult.session.user.id,
    id,
    enable,
  );

  if (!result) {
    return NextResponse.json({ error: "Reading not found" }, { status: 404 });
  }

  if (enable && result.shareId) {
    await trackServerEvent(ANALYTICS_EVENTS.READING_SHARED, {
      userId: authResult.session.user.id,
      properties: {
        reading_id: id,
        share_id: result.shareId,
        source: "api_patch",
      },
    });
  }

  const publicUrl =
    result.isPublic && result.shareId
      ? `${getAppUrl()}/share/${result.shareId}`
      : null;

  return NextResponse.json({
    isPublic: result.isPublic,
    shareId: result.shareId,
    publicUrl,
    url: publicUrl,
  });
}
