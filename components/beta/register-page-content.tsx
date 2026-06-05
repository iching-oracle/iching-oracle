"use client";

import { RegisterOnboarding } from "@/components/beta/register-onboarding";

type RegisterPageContentProps = {
  inviteOnly: boolean;
};

export function RegisterPageContent({ inviteOnly }: RegisterPageContentProps) {
  return <RegisterOnboarding inviteOnly={inviteOnly} />;
}
