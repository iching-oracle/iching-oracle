"use client";

import { motion } from "framer-motion";
import { OracleCard } from "@/components/oracle/oracle-card";
import type { OracleChatMessageDTO } from "@/types/oracle-chat";

type ChatMessageProps = {
  message: OracleChatMessageDTO;
};

export function ChatMessage({ message }: ChatMessageProps) {
  if (message.role === "oracle_reading" && message.metadata) {
    return <OracleCard meta={message.metadata} content={message.content} />;
  }

  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[min(100%,28rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "border border-amber-gold/25 bg-amber-gold/10 text-foreground"
            : message.role === "reflection"
              ? "border border-cosmic-violet/25 bg-cosmic-purple/10 text-foreground/95 italic"
              : "border border-white/10 bg-zen-surface/80 text-foreground/95 backdrop-blur-md"
        }`}
      >
        {!isUser ? (
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.25em] text-amber-gold/80">
            Guide
          </p>
        ) : null}
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </motion.div>
  );
}
