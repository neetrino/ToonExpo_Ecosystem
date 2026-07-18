import type { AccountType, UserResponse, UserStatus } from "@toonexpo/contracts";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  accountType: AccountType;
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
  accountType: user.accountType,
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
