"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId, useState } from "react";
import { showError, showRateLimit, showSuccess } from "@/hooks/use-app-toast";
import { contactFormSchema } from "@/lib/validations/contact";

type ContactFormProps = {
  defaultEmail?: string;
  defaultName?: string;
};

type FormStatus = "idle" | "loading" | "success" | "error";

export function ContactForm({
  defaultEmail = "",
  defaultName = "",
}: ContactFormProps) {
  const formId = useId();
  const honeypotId = `${formId}-company`;

  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(null);

    const form = event.currentTarget;
    const company =
      (form.elements.namedItem("company") as HTMLInputElement | null)?.value ??
      "";

    const parsed = contactFormSchema.safeParse({
      name,
      email,
      subject,
      message,
      company,
    });

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input";
      setFieldError(msg);
      showError(msg);
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = (await res.json()) as { error?: string; message?: string };

      if (res.status === 429) {
        setStatus("error");
        showRateLimit(data.error);
        return;
      }

      if (!res.ok) {
        setStatus("error");
        const msg = data.error ?? "Could not send your message.";
        setFieldError(msg);
        showError(msg);
        return;
      }

      setStatus("success");
      showSuccess(
        data.message ?? "Message sent. We will reply within two business days.",
      );
      setSubject("");
      setMessage("");
    } catch {
      setStatus("error");
      const msg = "Something went wrong. Please try again.";
      setFieldError(msg);
      showError(msg);
    }
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="rounded-2xl border border-amber-gold/25 bg-amber-gold/10 p-8 text-center sm:p-10"
        role="status"
        aria-live="polite"
      >
        <p className="font-serif text-2xl text-foreground">Message sent</p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-zen-muted">
          Thank you for reaching out. We typically respond within two business
          days.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-medium text-amber-gold transition-colors hover:text-amber-glow"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="relative space-y-5"
      aria-busy={status === "loading"}
      noValidate
    >
      {/* Honeypot — hidden from users and assistive tech */}
      <div
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
        aria-hidden="true"
      >
        <label htmlFor={honeypotId}>Company</label>
        <input
          id={honeypotId}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="auth-label" htmlFor={`${formId}-name`}>
            Name <span className="text-amber-gold/80">*</span>
          </label>
          <input
            id={`${formId}-name`}
            name="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status === "loading"}
            className="auth-input min-h-[44px] disabled:opacity-60"
            aria-required="true"
          />
        </div>
        <div>
          <label className="auth-label" htmlFor={`${formId}-email`}>
            Email <span className="text-amber-gold/80">*</span>
          </label>
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            className="auth-input min-h-[44px] disabled:opacity-60"
            aria-required="true"
          />
        </div>
      </div>

      <div>
        <label className="auth-label" htmlFor={`${formId}-subject`}>
          Subject <span className="text-amber-gold/80">*</span>
        </label>
        <input
          id={`${formId}-subject`}
          name="subject"
          type="text"
          required
          maxLength={200}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={status === "loading"}
          className="auth-input min-h-[44px] disabled:opacity-60"
          aria-required="true"
        />
      </div>

      <div>
        <label className="auth-label" htmlFor={`${formId}-message`}>
          Message <span className="text-amber-gold/80">*</span>
        </label>
        <textarea
          id={`${formId}-message`}
          name="message"
          required
          rows={6}
          maxLength={5000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={status === "loading"}
          className="auth-input min-h-[140px] resize-y disabled:opacity-60"
          aria-required="true"
          aria-describedby={`${formId}-message-hint`}
        />
        <p
          id={`${formId}-message-hint`}
          className="mt-1.5 text-xs text-zen-muted"
        >
          {message.length}/5000 characters
        </p>
      </div>

      <AnimatePresence>
        {fieldError ? (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            role="alert"
          >
            {fieldError}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <button
        type="submit"
        disabled={status === "loading"}
        className="auth-btn-primary min-h-[48px] w-full transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
        aria-describedby={status === "loading" ? `${formId}-loading` : undefined}
      >
        {status === "loading" ? "Sending…" : "Send message"}
      </button>
      {status === "loading" ? (
        <p id={`${formId}-loading`} className="sr-only">
          Sending your message
        </p>
      ) : null}
    </motion.form>
  );
}
