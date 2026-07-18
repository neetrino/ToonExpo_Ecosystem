import { ApiError } from "@/shared/api/errors";

export type AuthErrorCode =
  | "invalidCredentials"
  | "invalidToken"
  | "emailTaken"
  | "tooManyRequests"
  | "generic";

/**
 * Maps NestJS auth HTTP statuses to i18n error keys (login/register).
 */
export const mapAuthError = (error: unknown): AuthErrorCode => {
  if (!(error instanceof ApiError)) {
    return "generic";
  }

  if (error.status === 401) {
    return "invalidCredentials";
  }

  if (error.status === 409) {
    return "emailTaken";
  }

  if (error.status === 429) {
    return "tooManyRequests";
  }

  return "generic";
};

/**
 * Maps set-password failures (invalid/expired token → 401 from Nest).
 */
export const mapSetPasswordError = (error: unknown): AuthErrorCode => {
  if (!(error instanceof ApiError)) {
    return "generic";
  }

  if (error.status === 401 || error.status === 400 || error.status === 404) {
    return "invalidToken";
  }

  if (error.status === 429) {
    return "tooManyRequests";
  }

  return "generic";
};
