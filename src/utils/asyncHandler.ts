import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * asyncHandler — wraps an async route handler and forwards any rejection to
 * the next Express error middleware via `next(err)`.
 *
 * WHY keep this even though Express 5 propagates async errors natively?
 * 1. Explicit intent — wrapping a controller in asyncHandler signals to every
 *    reader that this handler is async and errors are deliberately forwarded.
 * 2. Consistent pattern — all controllers look the same regardless of Express
 *    version; future upgrades or regressions won't silently swallow errors.
 * 3. Belt-and-suspenders safety — if the async function rejects before Express
 *    5's own machinery catches it, our `.catch(next)` ensures the error still
 *    reaches the global error handler.
 *
 * Usage in a controller:
 *   router.post("/rfqs", asyncHandler(async (req, res) => { ... }));
 */
type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler = (fn: AsyncRouteHandler): RequestHandler => {
  return (req, res, next) => {
    // We do NOT return the Promise — the return value is intentionally void.
    // Errors are forwarded to `next`, which routes them to the error handler.
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
