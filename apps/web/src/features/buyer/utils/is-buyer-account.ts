import type { AccountType, UserResponse } from "@toonexpo/contracts";

/**
 * True when the user is a buyer (can use QR and send catalog requests).
 */
export const isBuyerAccount = (
  user: Pick<UserResponse, "accountType"> | null | undefined,
): boolean => user?.accountType === "buyer";

/**
 * Account types that must not see buyer request CTAs.
 */
export const isNonBuyerStaff = (
  accountType: AccountType | undefined,
): boolean =>
  accountType === "company_member" ||
  accountType === "platform_admin" ||
  accountType === "entrance_staff";
