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

const NETWORK_FETCH_MESSAGE = /fetch failed|failed to fetch|networkerror|load failed/i;
const NETWORK_CAUSE_CODE = /ECONNREFUSED|ENOTFOUND|ECONNRESET|ETIMEDOUT|UND_ERR/i;

/**
 * True when `fetch` failed before an HTTP response (API down, DNS, connection reset).
 */
export const isNetworkFetchError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  if (NETWORK_FETCH_MESSAGE.test(error.message)) {
    return true;
  }

  const cause = 'cause' in error ? error.cause : undefined;
  if (cause instanceof Error && NETWORK_CAUSE_CODE.test(cause.message)) {
    return true;
  }

  return false;
};
