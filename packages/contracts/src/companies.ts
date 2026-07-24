/**
 * Admin company provisioning and company-member invite contracts.
 */

import type { CompanyMemberRole, CompanyMemberStatus, CompanyType, UserResponse } from './auth.js';
import type {
  ApartmentAvailabilitySummary,
  ApartmentSalesStatus,
  MediaAssetSummary,
  PaginatedResponse,
  PublicationStatus,
} from './catalog.js';

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

/**
 * Cross-company building row for the admin buildings hub.
 */
export type AdminBuildingListItem = {
  id: string;
  name: string;
  publicationStatus: PublicationStatus;
  createdAt: string;
  projectId: string;
  projectName: string;
  builderCompanyId: string;
  companyName: string;
  floorsCount: number;
  apartmentsCount: number;
};

export type AdminBuildingListResponse = PaginatedResponse<AdminBuildingListItem>;

/**
 * Cross-company floor row for the admin floors hub.
 */
export type AdminFloorListItem = {
  id: string;
  number: number;
  name: string | null;
  displayLabel: string | null;
  publicationStatus: PublicationStatus;
  createdAt: string;
  buildingId: string;
  buildingName: string;
  projectId: string;
  projectName: string;
  builderCompanyId: string;
  companyName: string;
  apartmentsCount: number;
};

export type AdminFloorListResponse = PaginatedResponse<AdminFloorListItem>;

/**
 * Cross-company apartment row for the admin apartments hub.
 */
export type AdminApartmentListItem = {
  id: string;
  number: string;
  publicationStatus: PublicationStatus;
  salesStatus: ApartmentSalesStatus;
  createdAt: string;
  floorId: string;
  floorNumber: number;
  buildingId: string;
  buildingName: string;
  projectId: string;
  projectName: string;
  builderCompanyId: string;
  companyName: string;
};

export type AdminApartmentListResponse = PaginatedResponse<AdminApartmentListItem>;

/**
 * Floor row for the admin building inventory glance sheet.
 */
export type AdminBuildingInventoryFloor = {
  id: string;
  number: number;
  name: string | null;
  displayLabel: string | null;
  floorplanMediaId: string | null;
  floorplan: MediaAssetSummary | null;
  availability: ApartmentAvailabilitySummary;
};

/**
 * Building inventory glance (available / reserved / sold + per-floor bars).
 */
export type AdminBuildingInventoryGlance = {
  id: string;
  name: string;
  publicationStatus: PublicationStatus;
  floorsCount: number | null;
  projectId: string;
  projectName: string;
  builderCompanyId: string;
  availability: ApartmentAvailabilitySummary;
  floors: AdminBuildingInventoryFloor[];
};

export type CompanyMemberListResponse = PaginatedResponse<CompanyMemberResponse>;
