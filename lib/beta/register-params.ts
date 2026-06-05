export type RegisterOnboardingMode = "request" | "invite";

export function getInviteCodeFromSearchParams(
  params: Pick<URLSearchParams, "get">,
): string {
  const raw = params.get("code")?.trim() || params.get("invite")?.trim() || "";
  return raw.toUpperCase();
}

export function resolveInitialOnboardingMode(
  params: URLSearchParams,
): RegisterOnboardingMode {
  if (getInviteCodeFromSearchParams(params)) return "invite";
  const mode = params.get("mode");
  if (mode === "invite" || mode === "request") return mode;
  return "request";
}
