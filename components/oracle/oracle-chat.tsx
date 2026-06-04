"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatInput } from "@/components/oracle/chat-input";
import { ChatMessage } from "@/components/oracle/chat-message";
import { TypingIndicator } from "@/components/oracle/typing-indicator";
import { InsufficientCreditsModal } from "@/components/credits/insufficient-credits-modal";
import { CREDIT_ERROR_CODES } from "@/types/credits";
import type { OracleChatMessageDTO, OracleChatState } from "@/types/oracle-chat";

const STARTER_PROMPTS = [
  "I feel uncertain about my path.",
  "Something in my relationship weighs on me.",
  "I am at a crossroads and need clarity.",
  "I sense change coming but cannot name it.",
];

type OracleChatProps = {
  initialState: OracleChatState;
};

export function OracleChat({ initialState }: OracleChatProps) {
  const [conversationId, setConversationId] = useState<string | null>(
    initialState?.conversationId ?? null,
  );
  const [messages, setMessages] = useState<OracleChatMessageDTO[]>(
    initialState.messages,
  );
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [canSend, setCanSend] = useState(initialState.canSend);
  const [messageLimit, setMessageLimit] = useState<number | null>(
    initialState.messageLimit,
  );
  const [suggestCast, setSuggestCast] = useState(initialState.suggestCast);
  const [canCast, setCanCast] = useState(initialState.canCast);
  const [hasReading, setHasReading] = useState(initialState.hasReading);
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  const [creditsModalMessage, setCreditsModalMessage] = useState<string>();
  const [creditsModalCode, setCreditsModalCode] = useState<string>();
  const [started, setStarted] = useState(initialState.messages.length > 0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  const applyState = useCallback((state: OracleChatState) => {
    setConversationId(state.conversationId);
    setMessages(state.messages);
    setCanSend(state.canSend);
    setMessageLimit(state.messageLimit);
    setSuggestCast(state.suggestCast);
    setCanCast(state.canCast);
    setHasReading(state.hasReading);
    if (state.messages.length > 0) setStarted(true);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming || !canSend) return;

      setError(null);
      setInput("");
      setIsStreaming(true);
      setStreamingText("");
      setStarted(true);

      const tempUserId = `temp-user-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: tempUserId,
          role: "user",
          content: trimmed,
          createdAt: new Date().toISOString(),
        },
      ]);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/oracle/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: conversationId ?? undefined,
            message: trimmed,
          }),
          signal: controller.signal,
        });

        const newConvId = res.headers.get("X-Conversation-Id");
        if (newConvId) setConversationId(newConvId);

        if (!res.ok) {
          const data = (await res.json()) as { error?: string; code?: string };
          if (
            data.code === CREDIT_ERROR_CODES.INSUFFICIENT ||
            data.code === CREDIT_ERROR_CODES.PREMIUM_REQUIRED
          ) {
            setCanSend(false);
            setCreditsModalMessage(data.error);
            setCreditsModalCode(data.code);
            setCreditsModalOpen(true);
          }
          setMessages((prev) => prev.filter((m) => m.id !== tempUserId));
          setError(data.error ?? "The oracle could not respond.");
          return;
        }

        if (!res.body) throw new Error("No stream");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setStreamingText(accumulated);
        }

        const assistantMsg: OracleChatMessageDTO = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: accumulated.trim(),
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setStreamingText("");

        if (conversationId || newConvId) {
          const id = newConvId ?? conversationId;
          const stateRes = await fetch(`/api/oracle/chat?conversationId=${id}`);
          if (stateRes.ok) {
            const state = (await stateRes.json()) as OracleChatState;
            applyState(state);
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) => prev.filter((m) => m.id !== tempUserId));
          setError("Connection interrupted. Please try again.");
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, canSend, conversationId, applyState],
  );

  const handleCast = useCallback(async () => {
    if (!conversationId || isCasting || hasReading) return;
    setIsCasting(true);
    setError(null);

    try {
      const res = await fetch("/api/oracle/chat/cast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });

      const data = (await res.json()) as {
        error?: string;
        code?: string;
        state?: OracleChatState;
      };

      if (!res.ok) {
        if (
          data.code === CREDIT_ERROR_CODES.INSUFFICIENT ||
          data.code === CREDIT_ERROR_CODES.PREMIUM_REQUIRED
        ) {
          setCreditsModalMessage(data.error);
          setCreditsModalCode(data.code);
          setCreditsModalOpen(true);
        }
        setError(data.error ?? "Could not consult the oracle.");
        return;
      }

      if (data.state) applyState(data.state);
    } catch {
      setError("The casting was interrupted. Try again when ready.");
    } finally {
      setIsCasting(false);
    }
  }, [conversationId, isCasting, hasReading, applyState]);

  const handleNewConversation = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/oracle/chat/new", { method: "POST" });
    if (!res.ok) {
      setError("Could not start a new conversation.");
      return;
    }
    const state = (await res.json()) as OracleChatState;
    applyState(state);
    setStarted(false);
    setMessages([]);
    setStreamingText("");
  }, [applyState]);

  const showWelcome = !started && messages.length === 0;

  return (
    <div className="mobile-oracle-viewport relative flex flex-col overflow-hidden">
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124,58,237,0.12), transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(197,160,89,0.08), transparent 50%)",
        }}
        aria-hidden
      />

      <div className="relative flex min-h-0 flex-1 flex-col">
        {started ? (
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 sm:px-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-zen-muted">
              {hasReading ? "Reading complete" : "In reflection"}
            </p>
            <button
              type="button"
              onClick={() => void handleNewConversation()}
              className="text-[10px] uppercase tracking-widest text-amber-gold hover:underline"
            >
              New conversation
            </button>
          </div>
        ) : null}

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {showWelcome ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center py-8 text-center sm:py-16"
              >
                <motion.span
                  className="text-4xl text-amber-gold/80"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  aria-hidden
                >
                  ☯
                </motion.span>
                <h1 className="mt-6 font-serif text-2xl text-foreground sm:text-3xl">
                  Conversation Oracle
                </h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-zen-muted">
                  The oracle listens not only to questions,
                  <br />
                  but also to the silence beneath them.
                </p>
                <div className="mt-8 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      void sendMessage("I would like to begin a reflection.")
                    }
                    className="auth-btn-primary"
                  >
                    Start conversation
                  </button>
                </div>
                <div className="mt-10 flex w-full max-w-lg flex-col gap-2">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="rounded-xl border border-white/10 bg-zen-surface/50 px-4 py-3 text-left text-sm text-zen-muted transition-colors hover:border-amber-gold/30 hover:text-foreground"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <>
                {messages.map((m) => (
                  <ChatMessage key={m.id} message={m} />
                ))}
                {isStreaming && streamingText ? (
                  <ChatMessage
                    message={{
                      id: "streaming",
                      role: "assistant",
                      content: streamingText,
                      createdAt: new Date().toISOString(),
                    }}
                  />
                ) : null}
                {isStreaming && !streamingText ? <TypingIndicator /> : null}
              </>
            )}

            {suggestCast && canCast && !hasReading && !showWelcome ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 rounded-2xl border border-amber-gold/25 bg-amber-gold/5 p-4 text-center"
              >
                <p className="text-sm text-zen-muted">
                  The moment may be ripe for a formal reading.
                </p>
                <button
                  type="button"
                  onClick={() => void handleCast()}
                  disabled={isCasting}
                  className="auth-btn-primary text-sm disabled:opacity-50"
                >
                  {isCasting ? "Consulting the oracle…" : "Consult the oracle"}
                </button>
              </motion.div>
            ) : null}

            {error ? (
              <p className="text-center text-xs text-red-300" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        {!showWelcome ? (
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={() => void sendMessage(input)}
            disabled={isStreaming || !canSend}
          />
        ) : null}

        {!canSend ? (
          <p className="border-t border-white/5 px-4 py-2 text-center text-[10px] text-zen-muted">
            <a href="/billing" className="text-amber-gold hover:underline">
              View credits & billing
            </a>
          </p>
        ) : null}
      </div>

      <InsufficientCreditsModal
        open={creditsModalOpen}
        onClose={() => setCreditsModalOpen(false)}
        message={creditsModalMessage}
        code={creditsModalCode}
      />
    </div>
  );
}
