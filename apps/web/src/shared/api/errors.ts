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

const TECHNICAL_API_MESSAGE = /prisma|unique constraint|invocation/i;

/**
 * True when Nest/Prisma rejected a duplicate floor number for one building.
 */
export const isFloorNumberDuplicateApiError = (error: unknown): error is ApiError => {
  if (!(error instanceof ApiError)) {
    return false;
  }
  if (error.status === 409) {
    return true;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes('unique constraint') &&
    message.includes('number') &&
    (message.includes('building_id') || message.includes('buildingid'))
  );
};

/**
 * Raw Prisma / DB errors should not be shown in product UI.
 */
export const isTechnicalApiMessage = (message: string): boolean =>
  TECHNICAL_API_MESSAGE.test(message);

/** Stable message — Next.js error boundaries serialize this, not the class. */
export const API_UNREACHABLE_MESSAGE = 'API is unreachable';

const NETWORK_FETCH_MESSAGE =
  /fetch failed|failed to fetch|networkerror|load failed|api is unreachable/i;
const NETWORK_CAUSE_CODE = /ECONNREFUSED|ENOTFOUND|ECONNRESET|ETIMEDOUT|UND_ERR/i;

/**
 * `fetch` never got an HTTP response (Nest down, proxy refused, DNS, reset).
 * Thrown by `apiFetch` so RSC pages do not surface a raw `TypeError: fetch failed`.
 */
export class ApiNetworkError extends Error {
  constructor(cause?: unknown) {
    super(API_UNREACHABLE_MESSAGE);
    this.name = 'ApiNetworkError';
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

/** Wrap a low-level `fetch` failure as {@link ApiNetworkError}. */
export const toApiNetworkError = (error: unknown): ApiNetworkError =>
  error instanceof ApiNetworkError ? error : new ApiNetworkError(error);

/**
 * True when `fetch` failed before an HTTP response (API down, DNS, connection reset).
 */
export const isNetworkFetchError = (error: unknown): boolean => {
  if (error instanceof ApiNetworkError) {
    return true;
  }
  if (!(error instanceof Error)) {
    return false;
  }

  if (error.name === 'ApiNetworkError' || NETWORK_FETCH_MESSAGE.test(error.message)) {
    return true;
  }

  const cause = 'cause' in error ? error.cause : undefined;
  if (cause instanceof Error && NETWORK_CAUSE_CODE.test(cause.message)) {
    return true;
  }

  return false;
};

const CSRF_FORBIDDEN_MESSAGE = /csrf/i;

/**
 * Nest CSRF guards return 403 with a message containing "CSRF".
 * Permission denials are also 403 — do not treat those as CSRF.
 */
export const isCsrfForbiddenMessage = (message: string | undefined): boolean => {
  if (!message) {
    return false;
  }
  return CSRF_FORBIDDEN_MESSAGE.test(message);
};
