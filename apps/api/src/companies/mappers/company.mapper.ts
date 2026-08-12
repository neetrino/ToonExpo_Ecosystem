import type {
  CompanyResponse,
  CompanySource,
  CompanyStatus,
  CompanyType,
} from '@toonexpo/contracts';

type CompanyRecord = {
  id: string;
  name: string;
  description: string | null;
  type: CompanyType;
  status: CompanyStatus;
  source: CompanySource;
  bosCompanyId: string | null;
  logoMediaId?: string | null;
  logoMedia?: { id: string; fileUrl: string } | null;
  phone: string | null;
  contactPerson: string | null;
  email: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  region: string | null;
  address: string | null;
  mediaMaterialsUrl: string | null;
  advertisingMaterialsUrl: string | null;
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
  logoMediaId: company.logoMediaId ?? company.logoMedia?.id ?? null,
  logoUrl: company.logoMedia?.fileUrl ?? null,
  phone: company.phone,
  contactPerson: company.contactPerson,
  email: company.email,
  websiteUrl: company.websiteUrl,
  instagramUrl: company.instagramUrl,
  facebookUrl: company.facebookUrl,
  region: company.region,
  address: company.address,
  mediaMaterialsUrl: company.mediaMaterialsUrl,
  advertisingMaterialsUrl: company.advertisingMaterialsUrl,
  createdAt: company.createdAt.toISOString(),
  updatedAt: company.updatedAt.toISOString(),
});

type NullableStringPatch = {
  phone?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  region?: string | null;
  address?: string | null;
  mediaMaterialsUrl?: string | null;
  advertisingMaterialsUrl?: string | null;
  description?: string | null;
};

/**
 * Builds Prisma data for optional company profile string fields.
 */
export const buildCompanyProfilePatch = (
  input: NullableStringPatch,
): Record<string, string | null> => {
  const data: Record<string, string | null> = {};
  const assign = (key: keyof NullableStringPatch, value: string | null | undefined): void => {
    if (value === undefined) {
      return;
    }
    data[key] = value?.trim() ? value.trim() : null;
  };

  assign('description', input.description);
  assign('phone', input.phone);
  assign('contactPerson', input.contactPerson);
  assign('email', input.email);
  assign('websiteUrl', input.websiteUrl);
  assign('instagramUrl', input.instagramUrl);
  assign('facebookUrl', input.facebookUrl);
  assign('region', input.region);
  assign('address', input.address);
  assign('mediaMaterialsUrl', input.mediaMaterialsUrl);
  assign('advertisingMaterialsUrl', input.advertisingMaterialsUrl);

  return data;
};
