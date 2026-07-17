import type { ExhibitionEventStatus, VenuePathNodeKind } from '@toonexpo/domain';

import { serverApiRequest } from '@/lib/api/server';

export type PublicBooth = {
  id: string;
  code: string;
  label: string;
  xPercent: number;
  yPercent: number;
  note: string | null;
  company: { id: string; name: string; slug: string } | null;
  partner: { id: string; name: string; slug: string } | null;
  project: {
    id: string;
    name: string;
    slug: string;
    companySlug: string;
  } | null;
};
export type PublicPathNode = {
  id: string;
  xPercent: number;
  yPercent: number;
  kind: VenuePathNodeKind;
  boothId: string | null;
};
export type PublicPathEdge = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
};
export type PublicVenueMap = {
  id: string;
  imageUrl: string;
  imageAlt: string | null;
  entranceXPercent: number | null;
  entranceYPercent: number | null;
  event: { id: string; name: string; code: string; status: ExhibitionEventStatus };
  booths: PublicBooth[];
  pathNodes: PublicPathNode[];
  pathEdges: PublicPathEdge[];
};
export type CompanyBoothAssignment = {
  code: string;
  label: string;
  eventName: string;
};

export async function hasPublicVenueMap(): Promise<boolean> {
  return (await serverApiRequest<{ exists: boolean }>('/exhibition/venue/exists')).exists;
}

export function loadPublicVenueMap(): Promise<PublicVenueMap | null> {
  return serverApiRequest<PublicVenueMap | null>('/exhibition/venue');
}

export function loadCompanyActiveBooth(
  companyId: string,
): Promise<CompanyBoothAssignment | null> {
  return serverApiRequest<CompanyBoothAssignment | null>(
    `/exhibition/company-booth?companyId=${encodeURIComponent(companyId)}`,
  );
}
