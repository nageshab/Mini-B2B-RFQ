import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";

export interface AuthenticatedUser {
  id: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Authentication middleware.
 * Verifies Bearer JWT token from Authorization header and attaches the user's
 * id and role to req.user.
 * Rejects missing, malformed, invalid, or expired tokens with a 401 ApiError.
 */
export const authenticate: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new ApiError(401, "Authentication required: No token provided"));
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token || token.trim() === "") {
    next(new ApiError(401, "Authentication required: Invalid token format"));
    return;
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded.sub || !decoded.role) {
      next(new ApiError(401, "Invalid token payload"));
      return;
    }

    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError(401, "Token has expired"));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, "Invalid or malformed token"));
      return;
    }
    next(new ApiError(401, "Authentication failed"));
  }
};
