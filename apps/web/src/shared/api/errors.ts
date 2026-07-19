/**
 * Typed HTTP error from NestJS `/api/v1` responses.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly code?: string;

  constructor(status: number, statusText: string, message?: string, code?: string) {
    super(message ?? `API request failed: ${status} ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    if (code) {
      this.code = code;
    }
  }
}

/**
 * Returns true when the value is an {@link ApiError} with the given status.
 */
export const isApiErrorStatus = (error: unknown, status: number): error is ApiError => {
  return error instanceof ApiError && error.status === status;
};
