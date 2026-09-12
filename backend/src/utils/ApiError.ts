/**
 * ApiError — a deliberate, expected application error with a known HTTP status.
 *
 * WHY extend Error?
 * Extending the native Error class gives us a proper stack trace for
 * server-side debugging (never sent to clients) and lets instanceof checks
 * work correctly throughout the middleware chain.
 *
 * WHY Object.setPrototypeOf?
 * TypeScript compiling `extends Error` to ES5/CommonJS breaks the prototype
 * chain, causing `err instanceof ApiError` to return false even when it should
 * be true. Restoring the prototype explicitly fixes this — it is safe and
 * recommended by the TypeScript team.
 */
export interface ApiErrorDetail {
  path?: string;
  message: string;
}

export class ApiError extends Error {
  readonly statusCode: number;
  // Literal type — this is the discriminant that distinguishes ApiError
  // shapes from ApiResponse shapes in a union type.
  readonly success: false = false;
  readonly errors: ApiErrorDetail[];

  constructor(
    statusCode: number,
    message: string,
    errors: ApiErrorDetail[] = []
  ) {
    super(message); // Sets Error.message — must come before `this` is used.
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
