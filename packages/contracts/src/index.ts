/**
 * Health check response returned by NestJS `/api/v1/health`.
 */
export type HealthResponse = {
  status: "ok" | "degraded" | "error";
  service: string;
  timestamp: string;
};

/**
 * API version prefix used by NestJS controllers.
 */
export const API_V1_PREFIX = "/api/v1" as const;

export {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from "./auth.js";

export type {
  AccountType,
  AuthSessionResponse,
  CompanyMemberRole,
  CompanyType,
  CsrfTokenResponse,
  LoginRequest,
  RegisterRequest,
  UserResponse,
  UserStatus,
} from "./auth.js";
