/**
 * Partners / Participants contracts (admin, portal, public).
 */

import type { PaginatedResponse, PublicationStatus } from './catalog.js';
import type { LocaleTextMap } from './portal.js';

export type PartnerCompanyType =
  | 'builder'
  | 'bank'
  | 'it_company'
  | 'sponsor'
  | 'supplier'
  | 'insurance'
  | 'legal'
  | 'design_furniture'
  | 'service_company'
  | 'other';

export type PartnerCompanyStatus = 'active' | 'inactive';

export type PartnerContacts = {
  phone?: string;
  email?: string;
};

export type PartnerSocialLinks = Record<string, string>;

export type PartnerProfileTranslationsInput = {
  shortDescription?: LocaleTextMap;
  fullDescription?: LocaleTextMap;
};

export type PartnerOfferTranslationsInput = {
  title?: LocaleTextMap;
  description?: LocaleTextMap;
};

export type PartnerOfferItem = {
  id: string;
  title: string;
  description: string | null;
  type: string | null;
  publicationStatus: PublicationStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  translations?: PartnerOfferTranslationsInput;
};

export type AdminPartnerListItem = {
  id: string;
  companyId: string;
  type: PartnerCompanyType;
  name: string;
  slug: string;
  status: PartnerCompanyStatus;
  publicationStatus: PublicationStatus;
  featured: boolean;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminPartnerListResponse = PaginatedResponse<AdminPartnerListItem>;

export type AdminPartnerDetail = AdminPartnerListItem & {
  logoMediaId: string | null;
  coverMediaId: string | null;
  shortDescription: string | null;
  fullDescription: string | null;
  contacts: PartnerContacts | null;
  website: string | null;
  socialLinks: PartnerSocialLinks | null;
  offers: PartnerOfferItem[];
  translations?: PartnerProfileTranslationsInput;
};

export type CreateAdminPartnerBody = {
  companyId: string;
  type: PartnerCompanyType;
  name: string;
  slug?: string;
  logoMediaId?: string;
  coverMediaId?: string;
  shortDescription?: string;
  fullDescription?: string;
  contacts?: PartnerContacts;
  website?: string;
  socialLinks?: PartnerSocialLinks;
  status?: PartnerCompanyStatus;
  publicationStatus?: PublicationStatus;
  featured?: boolean;
  translations?: PartnerProfileTranslationsInput;
};

export type UpdateAdminPartnerBody = {
  type?: PartnerCompanyType;
  name?: string;
  slug?: string;
  logoMediaId?: string | null;
  coverMediaId?: string | null;
  shortDescription?: string | null;
  fullDescription?: string | null;
  contacts?: PartnerContacts | null;
  website?: string | null;
  socialLinks?: PartnerSocialLinks | null;
  status?: PartnerCompanyStatus;
  publicationStatus?: PublicationStatus;
  featured?: boolean;
  translations?: PartnerProfileTranslationsInput;
};

export type CreatePartnerOfferBody = {
  title: string;
  description?: string;
  type?: string;
  publicationStatus?: PublicationStatus;
  sortOrder?: number;
  translations?: PartnerOfferTranslationsInput;
};

export type UpdatePartnerOfferBody = {
  title?: string;
  description?: string | null;
  type?: string | null;
  publicationStatus?: PublicationStatus;
  sortOrder?: number;
  translations?: PartnerOfferTranslationsInput;
};

export type PortalPartnerDetail = {
  id: string;
  companyId: string;
  type: PartnerCompanyType;
  name: string;
  slug: string;
  status: PartnerCompanyStatus;
  publicationStatus: PublicationStatus;
  featured: boolean;
  logoMediaId: string | null;
  coverMediaId: string | null;
  shortDescription: string | null;
  fullDescription: string | null;
  contacts: PartnerContacts | null;
  website: string | null;
  socialLinks: PartnerSocialLinks | null;
  offers: PartnerOfferItem[];
  translations?: PartnerProfileTranslationsInput;
};

export type UpdatePortalPartnerBody = {
  shortDescription?: string | null;
  fullDescription?: string | null;
  contacts?: PartnerContacts | null;
  website?: string | null;
  socialLinks?: PartnerSocialLinks | null;
  logoMediaId?: string | null;
  coverMediaId?: string | null;
  translations?: PartnerProfileTranslationsInput;
};

export type PublicPartnerListItem = {
  id: string;
  type: PartnerCompanyType;
  name: string;
  slug: string;
  shortDescription: string | null;
  logoUrl: string | null;
  featured: boolean;
};

export type PublicPartnerListResponse = PaginatedResponse<PublicPartnerListItem>;

export type PublicPartnerOfferItem = {
  id: string;
  title: string;
  description: string | null;
  type: string | null;
  sortOrder: number;
};

/** Published mortgage terms for a bank partner profile. */
export type PublicPartnerBankOfferItem = {
  id: string;
  title: string;
  shortDescription: string | null;
  rate: string;
  apr: string | null;
  minDownPaymentPercent: string;
  termOptionsYears: number[];
  fees: string | null;
  calculationNotes: string | null;
  featured: boolean;
  sortOrder: number;
};

export type PublicPartnerDetail = {
  id: string;
  type: PartnerCompanyType;
  name: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  contacts: PartnerContacts | null;
  website: string | null;
  socialLinks: PartnerSocialLinks | null;
  logoUrl: string | null;
  coverUrl: string | null;
  featured: boolean;
  offers: PublicPartnerOfferItem[];
  /**
   * Published BankOffer rows for bank partners; empty for other types.
   */
  bankOffers: PublicPartnerBankOfferItem[];
  /**
   * Primary published mortgage rate (%) for bank partners; otherwise null.
   * Sourced from BankOffer (mortgage module), not PartnerOffer.
   */
  mortgageRate: string | null;
};
