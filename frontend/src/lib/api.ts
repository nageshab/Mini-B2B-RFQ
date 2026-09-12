import { ApiResponse, ApiFieldError } from "../types/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export class ApiClientError extends Error {
  readonly statusCode: number;
  readonly errors: ApiFieldError[];

  constructor(statusCode: number, message: string, errors: ApiFieldError[] = []) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Ensure endpoint starts with a slash
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  // Read stored JWT token
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    // Catch network / DNS / CORS connection failures
    throw new ApiClientError(
      0,
      "Unable to connect to the server. Please check your connection and try again."
    );
  }

  let data: ApiResponse<T>;
  try {
    data = (await response.json()) as ApiResponse<T>;
  } catch {
    // Fallback if backend returned non-JSON response
    throw new ApiClientError(
      response.status,
      `Request failed with status ${response.status}`
    );
  }

  if (!response.ok || !data.success) {
    throw new ApiClientError(
      data.statusCode || response.status,
      data.message || "An unexpected error occurred",
      data.errors || []
    );
  }

  return data;
}
