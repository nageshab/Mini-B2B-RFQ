import { Request, Response } from "express";
import { authService } from "./auth.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { SignupInput, LoginInput } from "./auth.schema";

export class AuthController {
  /**
   * Handles user signup.
   * Invokes authService.signup and returns 201 Created with safe user and token.
   */
  async signup(
    req: Request<unknown, unknown, SignupInput>,
    res: Response
  ): Promise<void> {
    const result = await authService.signup(req.body);
    res
      .status(201)
      .json(new ApiResponse(201, "User registered successfully", result));
  }

  /**
   * Handles user login.
   * Invokes authService.login and returns 200 OK with safe user and token.
   */
  async login(
    req: Request<unknown, unknown, LoginInput>,
    res: Response
  ): Promise<void> {
    const result = await authService.login(req.body);
    res.status(200).json(new ApiResponse(200, "Login successful", result));
  }
}

export const authController = new AuthController();
