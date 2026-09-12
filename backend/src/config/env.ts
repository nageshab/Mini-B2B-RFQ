import "dotenv/config";
import { z } from "zod";

/**
 * Validates all required environment variables at application startup.
 *
 * Why fail fast here?
 * A missing secret discovered at request time is far worse than a clear
 * startup error. process.exit(1) prevents a misconfigured server from serving
 * traffic silently broken.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Enforce a minimum length so an accidentally short secret is caught early.
  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET must be at least 16 characters"),

  JWT_EXPIRES_IN: z.string().default("24h"),

  // Coerce the string env var to a number for convenient use throughout the app.
  PORT: z.coerce.number().int().positive().default(3000),

  // Must be a valid URL — used for CORS origin restriction.
  FRONTEND_URL: z.string().url("FRONTEND_URL must be a valid URL"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Invalid environment configuration. Fix the following:");
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
