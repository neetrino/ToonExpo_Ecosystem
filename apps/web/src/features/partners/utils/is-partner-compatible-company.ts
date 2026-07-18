import type { CompanyType } from "@toonexpo/contracts";

import { PARTNER_COMPATIBLE_COMPANY_TYPES } from "@/features/partners/constants";

type PartnerCompatibleCompanyType =
  (typeof PARTNER_COMPATIBLE_COMPANY_TYPES)[number];

/**
 * Whether the company can use the partner portal and host a partner profile.
 */
export const isPartnerCompatibleCompany = (
  type: CompanyType,
): type is PartnerCompatibleCompanyType =>
  PARTNER_COMPATIBLE_COMPANY_TYPES.includes(type as PartnerCompatibleCompanyType);
