import type { ApartmentStatus } from '@toonexpo/domain';

import { serverApiRequest } from '@/lib/api/server';

export type ApartmentLinkOption = {
  apartmentId: string;
  code: string;
  buildingName: string;
  floorName: string;
  status: ApartmentStatus;
  priceAmd: number | null;
};

export type ProjectApartmentGroup = {
  projectId: string;
  projectName: string;
  apartments: ApartmentLinkOption[];
};

/** Apartments available for linking to a CRM deal (scoped to company, optionally one project). */
export async function loadApartmentLinkOptions(
  companyId: string,
  projectId?: string | null,
): Promise<ProjectApartmentGroup[]> {
  void companyId;
  const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
  return serverApiRequest<ProjectApartmentGroup[]>(`/crm/apartment-options${query}`);
}
