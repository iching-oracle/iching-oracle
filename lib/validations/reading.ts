import { z } from "zod";

export const createReadingSchema = z.object({
  question: z
    .string()
    .min(3, "Question must be at least 3 characters")
    .max(500, "Question must be at most 500 characters"),
});

export type CreateReadingInput = z.infer<typeof createReadingSchema>;
