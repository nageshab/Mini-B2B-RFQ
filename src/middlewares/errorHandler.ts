import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";

/**
 * errorHandler — the single, centralized Express error-handling middleware.
 *
 * Express identifies error-handling middleware by its four-parameter signature.
 * The `_next` parameter is intentionally unused but MUST be present; omitting
 * it causes Express to treat this as a regular middleware and skip it entirely
 * when an error is forwarded via next(err).
 *
 * Error priority order:
 *  1. ApiError        — deliberate application errors (thrown by services)
 *  2. ZodError        — request validation failures
 *  3. Prisma P2002    — unique constraint violation → 409 Conflict
 *  4. Prisma P2025    — record not found → 404 Not Found
 *  5. Everything else → logged server-side, generic 500 sent to client
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ── 1. Deliberate application errors ──────────────────────────────────────
  // Services throw `new ApiError(statusCode, message)` for expected failures
  // such as "supplier already submitted a quotation" or "RFQ is closed".
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // ── 2. Zod validation errors ───────────────────────────────────────────────
  // The validate middleware (Phase 4) passes ZodErrors via next(err).
  // We flatten issue paths to a dot-notation string that the React frontend
  // can map directly to form field names.
  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      path: issue.path.join(".") || "root",
      message: issue.message,
    }));
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Validation failed",
      errors,
    });
    return;
  }

  // ── 3. JWT authentication errors ──────────────────────────────────────────
  if (err instanceof jwt.JsonWebTokenError) {
    const message =
      err instanceof jwt.TokenExpiredError
        ? "Token has expired"
        : "Invalid or malformed token";
    res.status(401).json({
      success: false,
      statusCode: 401,
      message,
      errors: [],
    });
    return;
  }

  // ── 3. Prisma known request errors ────────────────────────────────────────
  // We only map specific codes we have agreed to handle. All other Prisma
  // errors fall through to the generic 500 handler below.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: unique constraint violated (e.g. duplicate email, duplicate quotation)
    if (err.code === "P2002") {
      res.status(409).json({
        success: false,
        statusCode: 409,
        message: "A record with the provided details already exists",
        errors: [],
      });
      return;
    }

    // P2025: record not found (e.g. update/delete on non-existent row)
    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "The requested record was not found",
        errors: [],
      });
      return;
    }
  }

  // ── 4. Unexpected errors ───────────────────────────────────────────────────
  // Log the full error server-side so it appears in deployment logs (Render,
  // Railway) for debugging. Never send stack traces, SQL, credentials, or
  // raw error messages to the client, even in development.
  console.error("[Unhandled Error]", err);

  res.status(500).json({
    success: false,
    statusCode: 500,
    message: "Internal server error",
    errors: [],
  });
};
