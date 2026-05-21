"use client";

import { motion } from "framer-motion";
import type { ChatMessageDTO } from "@/types/chat";

type ChatMessageBubbleProps = {
  message: ChatMessageDTO;
  isStreaming?: boolean;
};

export function ChatMessageBubble({
  message,
  isStreaming = false,
}: ChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[80%] ${
          isUser
            ? "border border-amber-gold/25 bg-amber-gold/10 text-foreground"
            : "border border-white/10 bg-zen-elevated/60 text-foreground/90 shadow-[0_0_24px_-12px_rgba(124,58,237,0.35)]"
        }`}
      >
        {!isUser ? (
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-cosmic-violet">
            Guide
          </p>
        ) : null}
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
          {isStreaming ? (
            <span
              className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-amber-gold align-middle"
              aria-hidden
            />
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
