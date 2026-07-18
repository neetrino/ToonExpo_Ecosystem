import type { AccountType, UserStatus } from "@toonexpo/contracts";

/**
 * Authenticated principal attached to the request after session validation.
 */
export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  accountType: AccountType;
  status: UserStatus;
  defaultLocale: string | null;
  createdAt: Date;
  updatedAt: Date;
  sessionId: string;
};
