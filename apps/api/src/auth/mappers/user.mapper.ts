import type { PlatformRole, UserResponse, UserStatus } from "@toonexpo/contracts";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: PlatformRole;
  status: UserStatus;
  defaultLocale: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Maps a persistence user record to the public API contract.
 */
export const toUserResponse = (user: UserRecord): UserResponse => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  status: user.status,
  defaultLocale: user.defaultLocale,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

/**
 * Normalizes email for storage and lookup (trim + lowercase).
 */
export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();
