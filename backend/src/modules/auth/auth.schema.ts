import { z } from "zod";
import { Role } from "@prisma/client";

/**
 * Validation schema for user registration (signup).
 * Enforces business rules:
 * - name: at least 2 characters
 * - email: valid email format
 * - password: at least 8 characters
 * - role: BUYER or SUPPLIER
 */
export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(Role),
});

export type SignupInput = z.infer<typeof signupSchema>;

/**
 * Validation schema for user authentication (login).
 */
export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
