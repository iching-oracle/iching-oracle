"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";
import { SuggestionChips } from "@/components/chat/SuggestionChips";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";
import { FOLLOW_UP_SUGGESTIONS } from "@/lib/chat/suggestions";
import type { ChatMessageDTO } from "@/types/chat";
import { FOLLOWUP_ERROR_CODES } from "@/types/chat";

type FollowUpChatProps = {
  readingId: string;
  initialMessages?: ChatMessageDTO[];
  initialCanSend?: boolean;
  initialMessageLimit?: number | null;
  initialUserMessageCount?: number;
};

export function FollowUpChat({
  readingId,
  initialMessages = [],
  initialCanSend = true,
  initialMessageLimit = 3,
  initialUserMessageCount = 0,
}: FollowUpChatProps) {
  const [messages, setMessages] = useState<ChatMessageDTO[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [canSend, setCanSend] = useState(initialCanSend);
  const [messageLimit, setMessageLimit] = useState(initialMessageLimit);
  const [userMessageCount, setUserMessageCount] = useState(
    initialUserMessageCount,
  );
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming || !canSend) return;

      setError(null);
      setInput("");
      setIsStreaming(true);
      setStreamingText("");

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
        const res = await fetch("/api/chat/followup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ readingId, message: trimmed }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = (await res.json()) as { error?: string; code?: string };
          if (data.code === FOLLOWUP_ERROR_CODES.MESSAGE_LIMIT) {
            setCanSend(false);
            setUpgradeOpen(true);
          }
          setMessages((prev) => prev.filter((m) => m.id !== tempUserId));
          setError(
            data.error ??
              "The oracle could not respond. Please try again.",
          );
          return;
        }

        if (!res.body) {
          throw new Error("No response stream");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setStreamingText(accumulated);
        }

        const assistantMsg: ChatMessageDTO = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: accumulated.trim(),
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setStreamingText("");
        setUserMessageCount((c) => c + 1);

        if (
          messageLimit !== null &&
          userMessageCount + 1 >= messageLimit
        ) {
          setCanSend(false);
        }

        void refreshState();
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setMessages((prev) => prev.filter((m) => m.id !== tempUserId));
        setError(
          "Connection interrupted. Your question was not lost — please try again.",
        );
      } finally {
        setIsStreaming(false);
        setStreamingText("");
        abortRef.current = null;
      }
    },
    [
      readingId,
      isStreaming,
      canSend,
      messageLimit,
      userMessageCount,
    ],
  );

  async function refreshState() {
    try {
      const res = await fetch(
        `/api/chat/followup?readingId=${encodeURIComponent(readingId)}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as {
        messages: ChatMessageDTO[];
        canSend: boolean;
        messageLimit: number | null;
        userMessageCount: number;
      };
      setMessages(data.messages);
      setCanSend(data.canSend);
      setMessageLimit(data.messageLimit);
      setUserMessageCount(data.userMessageCount);
    } catch {
      /* keep local state */
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  const limitLabel =
    messageLimit !== null
      ? `${userMessageCount}/${messageLimit} follow-ups used`
      : null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-cosmic-violet/25 bg-gradient-to-b from-zen-surface/90 via-cosmic-deep/20 to-zen-bg/80 p-5 backdrop-blur-xl sm:p-8">
      <div
        className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-cosmic-purple/20 blur-3xl"
        aria-hidden
      />

      <header className="relative mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-cosmic-violet">
          Continue the guidance
        </p>
        <p className="mt-2 text-sm text-zen-muted">
          Ask deeper questions about this reading. The guide remembers your
          hexagram and prior conversation.
        </p>
        {limitLabel ? (
          <p className="mt-2 text-xs text-zen-muted">{limitLabel}</p>
        ) : null}
      </header>

      {messages.length === 0 && !isStreaming ? (
        <div className="relative mb-4">
          <SuggestionChips
            suggestions={FOLLOW_UP_SUGGESTIONS}
            onSelect={(text) => void sendMessage(text)}
            disabled={!canSend || isStreaming}
          />
        </div>
      ) : null}

      <div
        ref={scrollRef}
        className="relative mb-4 max-h-[min(420px,50vh)] space-y-4 overflow-y-auto scroll-smooth pr-1"
      >
        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}
        {isStreaming && streamingText ? (
          <ChatMessageBubble
            message={{
              id: "streaming",
              role: "assistant",
              content: streamingText,
              createdAt: new Date().toISOString(),
            }}
            isStreaming
          />
        ) : isStreaming && !streamingText ? (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-white/10 bg-zen-elevated/50 px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-gold/70"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="mb-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      {!canSend && !isStreaming ? (
        <p className="mb-3 rounded-lg border border-amber-gold/25 bg-amber-gold/10 px-3 py-2 text-sm text-amber-glow">
          Follow-up limit reached for this reading.{" "}
          <button
            type="button"
            onClick={() => setUpgradeOpen(true)}
            className="font-medium underline underline-offset-2"
          >
            Upgrade to Premium
          </button>{" "}
          for unlimited guidance.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="relative flex gap-2">
        <label htmlFor={`followup-${readingId}`} className="sr-only">
          Follow-up message
        </label>
        <textarea
          id={`followup-${readingId}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!canSend || isStreaming}
          rows={2}
          maxLength={2000}
          placeholder="Ask a deeper question…"
          className="auth-input min-h-[52px] flex-1 resize-none text-sm disabled:opacity-50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void sendMessage(input);
            }
          }}
        />
        <button
          type="submit"
          disabled={!canSend || isStreaming || !input.trim()}
          className="auth-btn-primary shrink-0 self-end px-4 py-2.5 text-xs disabled:opacity-50"
        >
          {isStreaming ? "…" : "Send"}
        </button>
      </form>

      {messages.length > 0 ? (
        <div className="relative mt-4 border-t border-white/10 pt-4">
          <SuggestionChips
            suggestions={FOLLOW_UP_SUGGESTIONS}
            onSelect={(text) => {
              setInput(text);
              void sendMessage(text);
            }}
            disabled={!canSend || isStreaming}
          />
        </div>
      ) : null}

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        title="Unlimited guidance"
        message="Premium lets you continue the conversation without limits — a true spiritual companion for each reading."
      />
    </section>
  );
}
