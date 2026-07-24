import type { CompanyType, PartnerCompanyType } from '@toonexpo/contracts';

/** Mirrors NestJS partners module limits. */
export const PARTNERS_DEFAULT_PAGE_SIZE = 20;
export const PARTNERS_MAX_PAGE_SIZE = 50;
export const PARTNER_SEARCH_MIN_LENGTH = 1;

export const PARTNER_COMPANY_TYPES = [
  'builder',
  'bank',
  'it_company',
  'sponsor',
  'supplier',
  'insurance',
  'legal',
  'design_furniture',
  'service_company',
  'other',
] as const satisfies readonly PartnerCompanyType[];

export const PARTNER_COMPANY_STATUSES = ['active', 'inactive'] as const;

export const PARTNER_PUBLICATION_STATUSES = ['draft', 'published', 'archived'] as const;

/** Company.type values allowed to host a partner profile. */
export const PARTNER_COMPATIBLE_COMPANY_TYPES = [
  'partner',
  'bank',
  'service',
] as const satisfies readonly CompanyType[];

export const ADMIN_PARTNERS_QUERY_KEY = ['admin', 'partners'] as const;

export const adminPartnerQueryKey = (id: string) => [...ADMIN_PARTNERS_QUERY_KEY, id] as const;

export const PORTAL_PARTNER_QUERY_KEY = ['portal', 'partner'] as const;
