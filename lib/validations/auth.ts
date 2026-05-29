import { z } from "zod";
import { isStrongPassword } from "@/lib/password";

const strongPasswordSchema = z
  .string()
  .max(72, "Password must be at most 72 characters")
  .refine(isStrongPassword, {
    message:
      "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.",
  });

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters"),
    email: z.string().email("Invalid email address"),
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    inviteCode: z.string().max(32).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
