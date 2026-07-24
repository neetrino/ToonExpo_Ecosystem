import type {
  BuyerRequestListItem,
  CrmActivityItem,
  CrmApartmentLinkItem,
  CrmBuyerContact,
  CrmDealDetail,
  CrmDealListItem,
  CrmNoteItem,
  CrmRequestHistoryItem,
} from '@toonexpo/contracts';
import type { CrmDealStatus, RequestSource } from '@toonexpo/db';

import { mapDealStatusToBuyerFacing } from '../status/deal-status.transitions.js';

const toIso = (value: Date | null | undefined): string | null =>
  value == null ? null : value.toISOString();

type BuyerProfileRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
} | null;

type AssignedUserRow = { id: string; name: string } | null;

type ProjectRow = { id: string; name: string } | null;

export const mapBuyerContact = (
  profile: BuyerProfileRow,
  fallback: {
    contactName: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
  },
): CrmBuyerContact => ({
  buyerProfileId: profile?.id ?? null,
  name: profile?.name ?? fallback.contactName,
  phone: profile?.phone ?? fallback.contactPhone,
  email: profile?.email ?? fallback.contactEmail,
});

type DealListRow = {
  id: string;
  status: CrmDealStatus;
  source: RequestSource;
  projectId: string | null;
  project: ProjectRow;
  buyerProfile: BuyerProfileRow;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  assignedUserId: string | null;
  assignedUser: AssignedUserRow;
  lastActivityAt: Date | null;
  nextFollowUpAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  companyId?: string;
  company?: { id: string; name: string } | null;
};

export const mapDealListItem = (row: DealListRow): CrmDealListItem => ({
  id: row.id,
  status: row.status,
  source: row.source,
  projectId: row.projectId,
  projectName: row.project?.name ?? null,
  buyer: mapBuyerContact(row.buyerProfile, row),
  assignedUserId: row.assignedUserId,
  assignedUserName: row.assignedUser?.name ?? null,
  lastActivityAt: toIso(row.lastActivityAt),
  nextFollowUpAt: toIso(row.nextFollowUpAt),
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
  ...(row.company
    ? { companyId: row.company.id, companyName: row.company.name }
    : row.companyId
      ? { companyId: row.companyId }
      : {}),
});

export const mapRequestHistoryItem = (row: {
  id: string;
  source: RequestSource;
  note: string | null;
  projectId: string | null;
  apartmentId: string | null;
  scanEventId: string | null;
  createdAt: Date;
}): CrmRequestHistoryItem => ({
  id: row.id,
  source: row.source,
  note: row.note,
  projectId: row.projectId,
  apartmentId: row.apartmentId,
  scanEventId: row.scanEventId,
  createdAt: row.createdAt.toISOString(),
});

export const mapApartmentLinkItem = (row: {
  id: string;
  apartmentId: string;
  linkType: CrmApartmentLinkItem['linkType'];
  isPrimary: boolean;
  createdAt: Date;
  apartment: { number: string } | null;
}): CrmApartmentLinkItem => ({
  id: row.id,
  apartmentId: row.apartmentId,
  apartmentNumber: row.apartment?.number ?? null,
  linkType: row.linkType,
  isPrimary: row.isPrimary,
  createdAt: row.createdAt.toISOString(),
});

export const mapNoteItem = (row: {
  id: string;
  body: string;
  visibility: CrmNoteItem['visibility'];
  authorUserId: string;
  createdAt: Date;
  updatedAt: Date;
  author: { name: string };
}): CrmNoteItem => ({
  id: row.id,
  body: row.body,
  visibility: row.visibility,
  authorUserId: row.authorUserId,
  authorName: row.author.name,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const mapActivityItem = (row: {
  id: string;
  type: CrmActivityItem['type'];
  title: string;
  description: string | null;
  dueAt: Date | null;
  status: CrmActivityItem['status'];
  assignedUserId: string | null;
  completedAt: Date | null;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}): CrmActivityItem => ({
  id: row.id,
  type: row.type,
  title: row.title,
  description: row.description,
  dueAt: toIso(row.dueAt),
  status: row.status,
  assignedUserId: row.assignedUserId,
  completedAt: toIso(row.completedAt),
  createdByUserId: row.createdByUserId,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const mapDealDetail = (
  row: DealListRow & {
    message: string | null;
    lostReason: string | null;
    primaryRequestId: string | null;
    requests: Parameters<typeof mapRequestHistoryItem>[0][];
    apartmentLinks: Parameters<typeof mapApartmentLinkItem>[0][];
    notes: Parameters<typeof mapNoteItem>[0][];
    activities: Parameters<typeof mapActivityItem>[0][];
  },
): CrmDealDetail => ({
  ...mapDealListItem(row),
  message: row.message,
  lostReason: row.lostReason,
  primaryRequestId: row.primaryRequestId,
  requests: row.requests.map(mapRequestHistoryItem),
  apartments: row.apartmentLinks.map(mapApartmentLinkItem),
  notes: row.notes.map(mapNoteItem),
  activities: row.activities.map(mapActivityItem),
});

export const mapBuyerRequestItem = (row: {
  id: string;
  source: RequestSource;
  note: string | null;
  projectId: string | null;
  apartmentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  builderCompany: { id: string; name: string };
  project: { name: string } | null;
  crmDeal: { id: string; status: CrmDealStatus } | null;
}): BuyerRequestListItem => ({
  requestId: row.id,
  dealId: row.crmDeal?.id ?? null,
  source: row.source,
  buyerStatus: mapDealStatusToBuyerFacing(row.crmDeal?.status ?? ('new_request' as CrmDealStatus)),
  builderCompanyId: row.builderCompany.id,
  builderCompanyName: row.builderCompany.name,
  projectId: row.projectId,
  projectName: row.project?.name ?? null,
  apartmentId: row.apartmentId,
  note: row.note,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});
