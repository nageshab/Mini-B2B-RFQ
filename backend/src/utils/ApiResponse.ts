/**
 * ApiResponse — the standard shape for every successful API response.
 *
 * Using a class (instead of a plain object literal) gives:
 * - consistent structure enforced at construction time
 * - a named type for documentation and future frontend SDK generation
 * - `success: true` as a compile-time literal, making it the counterpart
 *   discriminant to `ApiError.success: false`
 *
 * Generic <T> keeps the data field type-safe without forcing callers to
 * cast. The default `unknown` is intentionally conservative.
 */
export class ApiResponse<T = unknown> {
  readonly success: true = true;
  readonly statusCode: number;
  readonly message: string;
  readonly data: T;

  constructor(statusCode: number, message: string, data: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
