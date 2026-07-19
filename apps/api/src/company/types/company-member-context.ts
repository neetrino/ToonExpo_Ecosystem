/**
 * Active company member context attached by CompanyMemberGuard.
 */
import type { CompanyMemberRole } from "@toonexpo/db";

export type CompanyMemberContext = {
  companyId: string;
  membershipId: string;
  role: CompanyMemberRole;
};
