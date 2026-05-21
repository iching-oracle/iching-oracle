import { z } from "zod";

export const followUpMessageSchema = z.object({
  readingId: z.string().min(1),
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be 2000 characters or fewer")
    .transform((value) =>
      value
        .replace(/<[^>]*>/g, "")
        .replace(/\0/g, "")
        .trim(),
    ),
});

export function sanitizeChatMessage(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/\0/g, "")
    .trim()
    .slice(0, 2000);
}
