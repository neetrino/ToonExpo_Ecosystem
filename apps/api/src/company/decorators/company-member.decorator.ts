import { SetMetadata } from "@nestjs/common";

export const COMPANY_MEMBER_KEY = "companyMember";

/**
 * Marks a route as requiring an active company_member membership.
 * Optional `builderOnly` restricts to Company.type = builder (portal).
 */
export const CompanyMember = (
  options: { builderOnly?: boolean } = {},
): MethodDecorator & ClassDecorator =>
  SetMetadata(COMPANY_MEMBER_KEY, {
    required: true,
    builderOnly: options.builderOnly === true,
  });
