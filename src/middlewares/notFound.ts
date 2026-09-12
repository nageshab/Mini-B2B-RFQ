import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

/**
 * notFound middleware — catches any request that reached the end of the
 * router stack without matching a registered route and passes a 404 ApiError
 * to the global error handler.
 *
 * Must be registered AFTER all application routes so it only fires when no
 * route matched. The global error handler then formats the response.
 */
export const notFound = (
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new ApiError(404, "Route not found"));
};
