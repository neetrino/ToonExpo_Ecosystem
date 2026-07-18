import type {
  CompanyResponse,
  CompanySource,
  CompanyStatus,
  CompanyType,
} from "@toonexpo/contracts";

type CompanyRecord = {
  id: string;
  name: string;
  description: string | null;
  type: CompanyType;
  status: CompanyStatus;
  source: CompanySource;
  bosCompanyId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Maps a persistence company record to the public API contract.
 */
export const toCompanyResponse = (company: CompanyRecord): CompanyResponse => ({
  id: company.id,
  name: company.name,
  description: company.description,
  type: company.type,
  status: company.status,
  source: company.source,
  bosCompanyId: company.bosCompanyId,
  createdAt: company.createdAt.toISOString(),
  updatedAt: company.updatedAt.toISOString(),
});
