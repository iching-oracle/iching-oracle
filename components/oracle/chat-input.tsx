"use client";

import { motion } from "framer-motion";
import { useRef } from "react";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
};

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "Share what is on your heart…",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="border-t border-white/10 bg-zen-bg/90 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder={placeholder}
          className="auth-input max-h-32 min-h-[44px] flex-1 resize-none py-3 text-sm"
          aria-label="Message to the oracle"
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="auth-btn-primary shrink-0 px-4 py-2.5 text-sm disabled:opacity-40"
        >
          Send
        </motion.button>
      </div>
    </div>
  );
}
