"use client";

import { useSession } from "next-auth/react";
import { BetaFeedbackWidget } from "@/components/beta/beta-feedback-widget";

export function BetaChrome() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return <BetaFeedbackWidget />;
}
