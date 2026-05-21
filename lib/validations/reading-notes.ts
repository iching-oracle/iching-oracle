import { z } from "zod";

export const readingNotesSchema = z.object({
  readingId: z.string().min(1),
  notes: z
    .string()
    .max(5000, "Notes must be 5000 characters or fewer")
    .transform((value) => value.trim()),
});

export function sanitizeReadingNotes(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/\0/g, "")
    .trim()
    .slice(0, 5000);
}
