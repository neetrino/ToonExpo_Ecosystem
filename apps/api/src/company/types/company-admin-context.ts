/**
 * Active company_admin context attached by CompanyAdminGuard.
 */
export type CompanyAdminContext = {
  companyId: string;
  membershipId: string;
};
