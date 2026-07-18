/**
 * Platform roles shared by API and web clients (v1).
 */
export type PlatformRole =
  | "bigprojects_admin"
  | "builder"
  | "partner"
  | "buyer"
  | "entrance_staff";

/**
 * Account lifecycle status shared by API and web clients.
 */
export type UserStatus = "active" | "inactive" | "suspended";

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
  role: PlatformRole;
  status: UserStatus;
  defaultLocale: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Auth mutation response that establishes or confirms a session cookie.
 */
export type AuthSessionResponse = {
  user: UserResponse;
};
