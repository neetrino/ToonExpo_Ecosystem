import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

import type { CompanyMemberContext } from "../types/company-member-context.js";

type RequestWithCompanyMember = Request & {
  companyMember?: CompanyMemberContext;
};

/**
 * Injects CompanyMemberContext set by CompanyMemberGuard.
 */
export const CurrentCompanyMember = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CompanyMemberContext => {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithCompanyMember>();
    const member = request.companyMember;
    if (!member) {
      throw new Error("CompanyMemberContext missing; ensure CompanyMemberGuard ran");
    }
    return member;
  },
);
