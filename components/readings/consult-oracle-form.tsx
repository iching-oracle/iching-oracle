"use client";

import { useActionState } from "react";
import {
  createReading,
  type CreateReadingState,
} from "@/lib/actions/readings";

const initialState: CreateReadingState = {};

export function ConsultOracleForm() {
  const [state, formAction, isPending] = useActionState(
    createReading,
    initialState,
  );

  return (
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

      {state.error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="auth-btn-primary w-full"
      >
        {isPending ? "Consulting the oracle…" : "Consult the Oracle"}
      </button>
    </form>
  );
}
