import { z } from "zod";
import { RfqStatus } from "@prisma/client";

/**
 * Validation schema for creating a new RFQ.
 * Requires product name, description, positive quantity, location, and a future deadline.
 */
export const createRfqSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters"),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than 0"),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters"),
  deadline: z
    .coerce
    .date({ message: "Invalid deadline date format" })
    .refine((date) => date.getTime() > Date.now(), {
      message: "Deadline must be a future date",
    }),
});

export type CreateRfqInput = z.infer<typeof createRfqSchema>;

/**
 * Validation schema for updating an existing RFQ.
 * All fields are optional, but at least one must be provided.
 */
export const updateRfqSchema = z
  .object({
    productName: z
      .string()
      .trim()
      .min(2, "Product name must be at least 2 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .min(5, "Description must be at least 5 characters")
      .optional(),
    quantity: z
      .number()
      .int("Quantity must be an integer")
      .positive("Quantity must be greater than 0")
      .optional(),
    location: z
      .string()
      .trim()
      .min(2, "Location must be at least 2 characters")
      .optional(),
    deadline: z
      .coerce
      .date({ message: "Invalid deadline date format" })
      .refine((date) => date.getTime() > Date.now(), {
        message: "Deadline must be a future date",
      })
      .optional(),
    status: z.enum(RfqStatus).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateRfqInput = z.infer<typeof updateRfqSchema>;

/**
 * Validation schema for supplier RFQ filtering & pagination query parameters.
 */
export const rfqFilterQuerySchema = z.object({
  search: z.string().trim().optional(),
  location: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type RfqFilterQuery = z.infer<typeof rfqFilterQuerySchema>;
