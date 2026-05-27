import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAppUrl } from "@/lib/stripe";
import { setReadingShareEnabled } from "@/lib/share/service";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  const result = await setReadingShareEnabled(session.user.id, id, enable);

  if (!result) {
    return NextResponse.json({ error: "Reading not found" }, { status: 404 });
  }

  const publicUrl =
    result.isPublic && result.shareId
      ? `${getAppUrl()}/share/${result.shareId}`
      : null;

  return NextResponse.json({
    isPublic: result.isPublic,
    shareId: result.shareId,
    publicUrl,
  });
}
