import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

import type { CompanyAdminContext } from "../types/company-admin-context.js";

type RequestWithCompanyAdmin = Request & {
  companyAdmin?: CompanyAdminContext;
};

/**
 * Returns the company_admin context attached by CompanyAdminGuard.
 */
export const CurrentCompanyAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CompanyAdminContext => {
    const request = context.switchToHttp().getRequest<RequestWithCompanyAdmin>();
    const companyAdmin = request.companyAdmin;

    if (!companyAdmin) {
      throw new Error("CompanyAdminGuard must run before CurrentCompanyAdmin");
    }

    return companyAdmin;
  },
);
