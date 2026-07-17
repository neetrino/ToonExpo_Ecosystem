import type { ExhibitionEventStatus, VenuePathNodeKind } from '@toonexpo/domain';

import { serverApiRequest } from '@/lib/api/server';

export type AdminVenueBoothRow = {
  id: string;
  code: string;
  label: string;
  xPercent: number;
  yPercent: number;
  note: string | null;
  sortOrder: number;
  companyId: string | null;
  partnerId: string | null;
  projectId: string | null;
  companyName: string | null;
  partnerName: string | null;
  projectName: string | null;
};
export type AdminPathNodeRow = {
  id: string;
  xPercent: number;
  yPercent: number;
  kind: VenuePathNodeKind;
  boothId: string | null;
};
export type AdminPathEdgeRow = { id: string; fromNodeId: string; toNodeId: string };
export type AdminVenueMapDetail = {
  event: { id: string; name: string; code: string; status: ExhibitionEventStatus };
  venueMap: {
    id: string;
    imageUrl: string;
    imageAlt: string | null;
    entranceXPercent: number | null;
    entranceYPercent: number | null;
  } | null;
  booths: AdminVenueBoothRow[];
  pathNodes: AdminPathNodeRow[];
  pathEdges: AdminPathEdgeRow[];
};
export type AdminAssignmentOption = { id: string; name: string };
export type AdminProjectOption = { id: string; name: string; companyId: string };

export function loadAdminVenueMapDetail(
  eventId: string,
): Promise<AdminVenueMapDetail | null> {
  return serverApiRequest<AdminVenueMapDetail | null>(
    `/exhibition/admin/events/${encodeURIComponent(eventId)}/venue`,
  );
}

export function loadAssignmentOptions(): Promise<{
  companies: AdminAssignmentOption[];
  partners: AdminAssignmentOption[];
  projects: AdminProjectOption[];
}> {
  return serverApiRequest('/exhibition/admin/assignment-options');
}
