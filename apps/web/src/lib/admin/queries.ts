import type { PartnerType, PublicationStatus } from '@toonexpo/domain';

import type { ProjectStatusCounts } from '@/lib/builder/queries';
import type { ProvisionedUserRow } from '@/components/admin/users-table';
import type { ProjectCompletenessKey } from '@/lib/projects/project-completeness';

import { adminApiRequest } from './admin-api';

export function loadProvisionedUsers(): Promise<ProvisionedUserRow[]> {
  return adminApiRequest<ProvisionedUserRow[]>('/users');
}

export type AdminCompanyRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  city: string | null;
  address: string | null;
  membersCount: number;
  projectsCount: ProjectStatusCounts;
  createdAt: Date;
};

export type AdminProjectRow = {
  id: string;
  name: string;
  companyName: string;
  status: PublicationStatus;
  buildingsCount: number;
  updatedAt: Date;
  completenessMissingKeys: ProjectCompletenessKey[];
};

export type AdminPartnerRow = {
  id: string;
  name: string;
  slug: string;
  type: PartnerType;
  status: PublicationStatus;
  offersCount: number;
  updatedAt: Date;
};

export type AdminPartnerDetail = {
  id: string;
  name: string;
  slug: string;
  type: PartnerType;
  logoUrl: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  serviceCategories: string[];
  status: PublicationStatus;
  companyId: string | null;
  bankOffers: AdminBankOfferRow[];
};

export type AdminBankOfferRow = {
  id: string;
  title: string;
  description: string | null;
  interestRate: number;
  minDownPaymentPercent: number;
  maxTermMonths: number;
  maxAmountAmd: number | null;
  featured: boolean;
  status: PublicationStatus;
  updatedAt: Date;
};

export type AdminPartnerOption = {
  id: string;
  name: string;
  type: PartnerType;
};

export async function loadAllCompanies(): Promise<AdminCompanyRow[]> {
  return adminApiRequest<AdminCompanyRow[]>('/companies');
}

export async function loadAllProjects(
  statusFilter?: PublicationStatus,
): Promise<AdminProjectRow[]> {
  const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
  return adminApiRequest<AdminProjectRow[]>(`/projects${query}`);
}

export async function loadAllPartners(typeFilter?: PartnerType): Promise<AdminPartnerRow[]> {
  const query = typeFilter ? `?type=${encodeURIComponent(typeFilter)}` : '';
  return adminApiRequest<AdminPartnerRow[]>(`/partners${query}`);
}

export async function loadPartnerDetail(partnerId: string): Promise<AdminPartnerDetail | null> {
  return adminApiRequest<AdminPartnerDetail | null>(`/partners/${encodeURIComponent(partnerId)}`);
}

export async function loadPartnerOptions(): Promise<AdminPartnerOption[]> {
  return adminApiRequest<AdminPartnerOption[]>('/partners/options');
}
