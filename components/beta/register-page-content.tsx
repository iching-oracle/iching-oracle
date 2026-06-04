"use client";

import { useSearchParams } from "next/navigation";
import { RegisterForm } from "@/components/register-form";
import { BetaAccessGate } from "@/components/beta/beta-access-gate";

type RegisterPageContentProps = {
  inviteOnly: boolean;
};

export function RegisterPageContent({ inviteOnly }: RegisterPageContentProps) {
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite")?.trim();

  if (inviteOnly && !invite) {
    return <BetaAccessGate />;
  }

  return <RegisterForm inviteRequired={inviteOnly} />;
}
