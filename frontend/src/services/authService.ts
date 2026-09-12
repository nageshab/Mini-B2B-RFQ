import { apiClient } from "../lib/api";
import {
  AuthResult,
  LoginCredentials,
  SignupData,
  ApiResponse,
} from "../types/auth";

export const authService = {
  /**
   * Authenticates a user with email and password.
   * Calls POST /api/auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const response = await apiClient<AuthResult>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return response.data;
  },

  /**
   * Registers a new buyer or supplier user.
   * Calls POST /api/auth/signup
   */
  async signup(data: SignupData): Promise<AuthResult> {
    const response = await apiClient<AuthResult>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },
};
