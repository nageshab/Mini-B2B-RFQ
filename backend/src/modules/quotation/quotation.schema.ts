import { z } from "zod";

/**
 * Validation schema for submitting a quotation.
 * Strictly enforces canonical field names:
 * - quotedPrice: positive finite number
 * - estimatedDeliveryDays: positive integer
 * - message: optional trimmed string up to 1000 characters
 * Unsupported aliases (e.g. price, notes) or extra fields are strictly rejected.
 */
export const createQuotationSchema = z
  .object({
    quotedPrice: z
      .number({ message: "Quoted price is required and must be a number" })
      .positive("Quoted price must be greater than 0")
      .finite("Quoted price must be a finite number"),
    estimatedDeliveryDays: z
      .number({
        message: "Estimated delivery days is required and must be an integer",
      })
      .int("Estimated delivery days must be an integer")
      .positive("Estimated delivery days must be greater than 0"),
    message: z
      .string()
      .trim()
      .max(1000, "Message must not exceed 1000 characters")
      .optional(),
  })
  .strict();

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
