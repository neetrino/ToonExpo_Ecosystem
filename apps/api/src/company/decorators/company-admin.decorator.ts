import { SetMetadata } from "@nestjs/common";

export const COMPANY_ADMIN_KEY = "companyAdmin";

/**
 * Marks a route as requiring an active company_admin membership.
 */
export const CompanyAdmin = (): MethodDecorator & ClassDecorator =>
  SetMetadata(COMPANY_ADMIN_KEY, true);
