import { CompanyType, PartnerCompanyType } from '@toonexpo/db';

/**
 * Maps a partner profile type to the host Company.type for provisioning.
 */
export const mapPartnerTypeToCompanyType = (
  partnerType: PartnerCompanyType,
): CompanyType => {
  if (partnerType === PartnerCompanyType.bank) {
    return CompanyType.bank;
  }
  if (partnerType === PartnerCompanyType.service_company) {
    return CompanyType.service;
  }
  return CompanyType.partner;
};
