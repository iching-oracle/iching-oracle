import "server-only";

import { NextResponse } from "next/server";
import { isAiDisabled, isMaintenanceMode } from "@/lib/protection/config";
import { USER_MESSAGES } from "@/lib/errors/messages";

export function maintenanceResponse(): NextResponse {
  return NextResponse.json(
    {
      error:
        "The oracle is in quiet maintenance. Please return in a little while.",
      code: "MAINTENANCE",
    },
    { status: 503 },
  );
}

export function aiDisabledResponse(): NextResponse {
  return NextResponse.json(
    {
      error: USER_MESSAGES.aiUnavailable,
      code: "AI_DISABLED",
    },
    { status: 503 },
  );
}

export function assertNotInMaintenance(): NextResponse | null {
  if (isMaintenanceMode()) return maintenanceResponse();
  return null;
}

export function assertAiEnabled(): NextResponse | null {
  if (isAiDisabled()) return aiDisabledResponse();
  if (isMaintenanceMode()) return maintenanceResponse();
  return null;
}
