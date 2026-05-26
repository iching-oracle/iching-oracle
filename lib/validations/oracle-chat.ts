import { z } from "zod";

export const oracleChatMessageSchema = z.object({
  conversationId: z.string().min(1).optional(),
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

export const oracleCastSchema = z.object({
  conversationId: z.string().min(1),
});
