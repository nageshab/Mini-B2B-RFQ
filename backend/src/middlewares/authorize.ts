import { Request, Response, NextFunction, RequestHandler } from "express";
import { Role } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

/**
 * Role-based authorization middleware.
 * Verifies that the authenticated user on req.user possesses one of the allowed roles.
 * Must be placed after authenticate middleware.
 * Returns 401 if not authenticated, 403 if authenticated but role is not permitted.
 */
export const authorize = (...allowedRoles: Role[]): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, "Authentication required"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new ApiError(
          403,
          "Forbidden: You do not have permission to access this resource"
        )
      );
      return;
    }

    next();
  };
};
