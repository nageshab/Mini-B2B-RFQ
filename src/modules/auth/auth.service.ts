import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { generateToken } from "../../utils/jwt";
import { SignupInput, LoginInput } from "./auth.schema";

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  user: SafeUser;
  token: string;
}

// Sensible cost factor balancing security and hashing latency (~80-100ms)
const BCRYPT_SALT_ROUNDS = 10;

export class AuthService {
  /**
   * Registers a new user.
   * Normalizes email to lowercase, hashes password with bcrypt,
   * creates user in the database, and returns safe user data with a signed JWT.
   */
  async signup(input: SignupInput): Promise<AuthResult> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: input.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const token = generateToken({
      sub: user.id,
      role: user.role,
    });

    return {
      user,
      token,
    };
  }

  /**
   * Authenticates an existing user.
   * Normalizes email, verifies bcrypt password hash, and returns
   * safe user information with a signed JWT.
   * Emits identical generic 401 errors to prevent user enumeration.
   */
  async login(input: LoginInput): Promise<AuthResult> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Constant generic error message prevents email enumeration attacks
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
      input.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = generateToken({
      sub: user.id,
      role: user.role,
    });

    const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      user: safeUser,
      token,
    };
  }
}

export const authService = new AuthService();
