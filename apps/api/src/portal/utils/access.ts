import {
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { CompanyMemberRole } from "@toonexpo/db";

import type { CompanyMemberContext } from "../../company/types/company-member-context.js";

/**
 * Throws 403 when the member is not company_admin.
 */
export const assertCompanyAdmin = (member: CompanyMemberContext): void => {
  if (member.role !== CompanyMemberRole.company_admin) {
    throw new ForbiddenException("Company admin access required");
  }
};

/**
 * Returns a NotFoundException used for cross-company isolation (no 403 leak).
 */
export const entityNotFound = (entity: string): NotFoundException =>
  new NotFoundException(`${entity} not found`);
