/**
 * Exclusive platform account type (one user = one type).
 */
export type AccountType =
  | "buyer"
  | "platform_admin"
  | "entrance_staff"
  | "company_member";

/**
 * Role inside a company (v1). Applies when accountType = company_member.
 */
export type CompanyMemberRole = "company_admin" | "member";

/**
 * Business organization type (not a user account type).
 */
export type CompanyType = "builder" | "partner" | "bank" | "service";

/**
 * Account lifecycle status shared by API and web clients.
 * `invited` = provisioned user without a password yet.
 */
export type UserStatus = "invited" | "active" | "inactive" | "blocked";

/**
 * Membership lifecycle inside a company (v1).
 */
export type CompanyMemberStatus = "active" | "inactive" | "removed";

/**
 * Buyer self-registration payload.
 */
export type RegisterRequest = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

/**
 * Email+password login payload.
 */
export type LoginRequest = {
  email: string;
  password: string;
};

/**
 * Public user projection without credential fields.
 */
export type UserResponse = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  accountType: AccountType;
  status: UserStatus;
  defaultLocale: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Cookie name for the non-httpOnly double-submit CSRF token (readable by JS when same-origin).
 */
export const CSRF_COOKIE_NAME = "toonexpo_csrf" as const;

/**
 * Request header carrying the double-submit CSRF token on mutating API calls.
 */
export const CSRF_HEADER_NAME = "X-CSRF-Token" as const;

/**
 * Auth mutation response that establishes or confirms a session cookie.
 * `csrfToken` mirrors the CSRF cookie for cross-origin clients that cannot read API-host cookies.
 */
export type AuthSessionResponse = {
  user: UserResponse;
  csrfToken: string;
};

/**
 * CSRF token for the current session (e.g. after page reload).
 */
export type CsrfTokenResponse = {
  csrfToken: string;
};
