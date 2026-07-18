import { SetMetadata } from "@nestjs/common";
import type { AccountType } from "@toonexpo/contracts";

export const ACCOUNT_TYPES_KEY = "accountTypes";

/**
 * Restricts a route to one or more exclusive account types.
 */
export const AccountTypes = (
  ...accountTypes: AccountType[]
): MethodDecorator & ClassDecorator =>
  SetMetadata(ACCOUNT_TYPES_KEY, accountTypes);
