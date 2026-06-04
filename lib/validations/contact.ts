import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name ist erforderlich.")
    .max(120, "Name darf maximal 120 Zeichen lang sein."),
  email: z
    .string()
    .trim()
    .email("Bitte geben Sie eine gültige E-Mail-Adresse ein.")
    .max(254, "E-Mail ist zu lang."),
  subject: z
    .string()
    .trim()
    .min(2, "Betreff muss mindestens 2 Zeichen haben.")
    .max(200, "Betreff darf maximal 200 Zeichen lang sein."),
  message: z
    .string()
    .trim()
    .min(10, "Nachricht muss mindestens 10 Zeichen haben.")
    .max(5000, "Nachricht darf maximal 5000 Zeichen lang sein."),
  /** Honeypot — must stay empty; bots often fill hidden fields. */
  company: z.string().max(200).optional().default(""),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
