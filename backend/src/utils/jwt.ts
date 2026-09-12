import jwt, { JwtPayload as BaseJwtPayload, SignOptions } from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";

export interface UserJwtPayload {
  sub: string;
  role: Role;
}

/**
 * Generates a signed JWT for the authenticated user.
 * Payload includes strictly necessary identity and role data:
 * { sub: userId, role: role }
 */
export const generateToken = (payload: UserJwtPayload): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

/**
 * Verifies and decodes a JWT token using the application JWT secret.
 * Validates at runtime that sub is a non-empty string and role is strictly BUYER or SUPPLIER.
 * Throws JsonWebTokenError or TokenExpiredError if invalid.
 */
export const verifyToken = (token: string): UserJwtPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof (decoded as Record<string, unknown>).sub !== "string" ||
    ((decoded as Record<string, unknown>).sub as string).trim() === "" ||
    ((decoded as Record<string, unknown>).role !== Role.BUYER &&
      (decoded as Record<string, unknown>).role !== Role.SUPPLIER)
  ) {
    throw new jwt.JsonWebTokenError("Invalid token payload");
  }

  const payload = decoded as BaseJwtPayload & { sub: string; role: Role };

  return {
    sub: payload.sub,
    role: payload.role,
  };
};
