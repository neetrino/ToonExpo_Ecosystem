import { ApiError } from "@/shared/api/errors";

export type AuthErrorCode =
  | "invalidCredentials"
  | "emailTaken"
  | "tooManyRequests"
  | "generic";

/**
 * Maps NestJS auth HTTP statuses to i18n error keys.
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
