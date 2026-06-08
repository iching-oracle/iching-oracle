"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createReading,
  type CreateReadingState,
} from "@/lib/actions/readings";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";
import { AiDisclaimer } from "@/components/trust/ai-disclaimer";
import { SUBSCRIPTION_ERROR_CODES } from "@/types/subscription";

const initialState: CreateReadingState = {};

export function ConsultOracleForm() {
  const [state, formAction, isPending] = useActionState(
    createReading,
    initialState,
  );
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const showUpgrade =
    state.code === SUBSCRIPTION_ERROR_CODES.DAILY_LIMIT ||
    (state.error?.includes("readings per day") ?? false);

  useEffect(() => {
    if (showUpgrade) setUpgradeOpen(true);
  }, [showUpgrade, state.error]);

  return (
    <>
      <form action={formAction} className="space-y-6">
        <div>
          <label htmlFor="question" className="auth-label">
            Your question
          </label>
          <textarea
            id="question"
            name="question"
            required
            rows={5}
            disabled={isPending}
            className="auth-input resize-none disabled:opacity-60"
            placeholder="What guidance do you seek?"
            maxLength={500}
          />
        </div>

        {state.error && !showUpgrade ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {state.error}
          </p>
        ) : null}

        {state.error && showUpgrade ? (
          <div className="rounded-lg border border-amber-gold/30 bg-amber-gold/10 px-4 py-3 text-sm text-amber-glow">
            <p>{state.error}</p>
            <button
              type="button"
              onClick={() => setUpgradeOpen(true)}
              className="mt-3 text-xs font-medium uppercase tracking-wider text-amber-gold underline-offset-2 hover:underline"
            >
              Upgrade to Premium →
            </button>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="auth-btn-primary min-h-[44px] w-full"
        >
          {isPending ? "Consulting the oracle quietly…" : "Consult the oracle"}
        </button>

        <AiDisclaimer className="text-center" />
      </form>

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        message={state.error}
      />
    </>
  );
}
