/**
 * Admin company provisioning and company-member invite contracts.
 */

import type { CompanyMemberRole, CompanyMemberStatus, CompanyType, UserResponse } from './auth.js';
import type { PaginatedResponse, PublicationStatus } from './catalog.js';

export type CompanyStatus = 'active' | 'inactive' | 'pending';

export type CompanySource = 'self_registered' | 'admin' | 'bos';

/**
 * Public company projection for admin and company portal APIs.
 */
export type CompanyResponse = {
  id: string;
  name: string;
  description: string | null;
  type: CompanyType;
  status: CompanyStatus;
  source: CompanySource;
  bosCompanyId: string | null;
  logoMediaId: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Authenticated company member's company profile (`GET /company/me`).
 */
export type CompanyProfileResponse = {
  id: string;
  name: string;
  type: CompanyType;
  status: CompanyStatus;
  logoMediaId: string | null;
  logoUrl: string | null;
  role: CompanyMemberRole;
};

/**
 * Platform-admin company create payload (first company_admin invited).
 */
export type CreateCompanyRequest = {
  name: string;
  type: CompanyType;
  description?: string;
  adminName: string;
  adminEmail: string;
  adminPhone?: string;
  /** Locale segment in the set-password link; defaults to platform DEFAULT_LOCALE (`hy`). */
  locale?: string;
};

/**
 * Platform-admin company update payload.
 */
export type UpdateCompanyRequest = {
  name?: string;
  description?: string | null;
  status?: CompanyStatus;
  logoMediaId?: string | null;
};

/**
 * Company-admin self-service profile update (`PATCH /company/me`).
 */
export type UpdateCompanyProfileRequest = {
  logoMediaId?: string | null;
};

/**
 * Result of provisioning a company with its first admin invite.
 */
export type ProvisionCompanyResponse = {
  company: CompanyResponse;
  adminUser: UserResponse;
};

/**
 * Company-admin staff invite payload.
 */
export type InviteCompanyMemberRequest = {
  name: string;
  email: string;
  phone?: string;
  role: CompanyMemberRole;
  /** Locale segment in the set-password link. */
  locale?: string;
};

/**
 * Company member row for team management lists.
 */
export type CompanyMemberResponse = {
  id: string;
  companyId: string;
  role: CompanyMemberRole;
  status: CompanyMemberStatus;
  invitedByUserId: string | null;
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: UserResponse;
};

/**
 * Patch membership role and/or lifecycle status.
 */
export type UpdateCompanyMemberRequest = {
  role?: CompanyMemberRole;
  status?: CompanyMemberStatus;
};

/**
 * Set-password payload for provisioned / invited users.
 */
export type SetPasswordRequest = {
  token: string;
  password: string;
};

export type CompanyListResponse = PaginatedResponse<CompanyResponse>;

/**
 * Lightweight project row for admin company project pickers.
 */
export type AdminCompanyProjectListItem = {
  id: string;
  name: string;
  publicationStatus: PublicationStatus;
  createdAt: string;
};

export type AdminCompanyProjectListResponse = {
  data: AdminCompanyProjectListItem[];
};

/**
 * Cross-company project row for the admin projects list.
 */
export type AdminProjectListItem = {
  id: string;
  name: string;
  publicationStatus: PublicationStatus;
  createdAt: string;
  city: string | null;
  builderCompanyId: string;
  companyName: string;
  buildingsCount: number;
  apartmentsCount: number;
};

export type AdminProjectListResponse = PaginatedResponse<AdminProjectListItem>;

/**
 * Scope payload so admin project UI can bind company catalog APIs.
 */
export type AdminProjectScope = {
  builderCompanyId: string;
};

export type CompanyMemberListResponse = PaginatedResponse<CompanyMemberResponse>;
