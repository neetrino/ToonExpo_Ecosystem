import type {
  BuyerRequestListItem,
  CrmActivityItem,
  CrmApartmentLinkItem,
  CrmBuyerContact,
  CrmDealDetail,
  CrmDealListItem,
  CrmNoteItem,
  CrmPaymentItem,
  CrmRequestHistoryItem,
} from '@toonexpo/contracts';
import type { CrmDealStatus, Prisma, RequestSource } from '@toonexpo/db';
import { formatPersonName } from '@toonexpo/shared';

import { CRM_DEFAULT_PAYMENT_CURRENCY } from '../crm.constants.js';
import { mapDealStatusToBuyerFacing } from '../status/deal-status.transitions.js';

const toIso = (value: Date | null | undefined): string | null =>
  value == null ? null : value.toISOString();

const decimalToString = (value: Prisma.Decimal | null | undefined): string | null =>
  value == null ? null : value.toString();

type BuyerProfileRow = {
  id: string;
  name: string;
  surname?: string | null;
  phone: string;
  email: string;
} | null;

type AssignedUserRow = { id: string; name: string; surname?: string | null } | null;

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
  name: profile
    ? formatPersonName(profile.name, profile.surname)
    : fallback.contactName,
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
  assignedUserName: row.assignedUser
    ? formatPersonName(row.assignedUser.name, row.assignedUser.surname)
    : null,
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
  priceAtLink: Prisma.Decimal | null;
  apartment: {
    number: string;
    price: Prisma.Decimal | null;
    priceCurrency: string;
  } | null;
}): CrmApartmentLinkItem => ({
  id: row.id,
  apartmentId: row.apartmentId,
  apartmentNumber: row.apartment?.number ?? null,
  linkType: row.linkType,
  isPrimary: row.isPrimary,
  price: decimalToString(row.apartment?.price) ?? decimalToString(row.priceAtLink),
  priceCurrency: row.apartment?.priceCurrency ?? CRM_DEFAULT_PAYMENT_CURRENCY,
  createdAt: row.createdAt.toISOString(),
});

export const mapPaymentItem = (row: {
  id: string;
  amount: Prisma.Decimal;
  currency: string;
  note: string | null;
  createdByUserId: string;
  createdAt: Date;
  createdBy: { name: string; surname?: string | null };
}): CrmPaymentItem => ({
  id: row.id,
  amount: row.amount.toString(),
  currency: row.currency,
  note: row.note,
  createdByUserId: row.createdByUserId,
  createdByName: formatPersonName(row.createdBy.name, row.createdBy.surname),
  createdAt: row.createdAt.toISOString(),
});

export const mapNoteItem = (row: {
  id: string;
  body: string;
  visibility: CrmNoteItem['visibility'];
  authorUserId: string;
  createdAt: Date;
  updatedAt: Date;
  author: { name: string; surname?: string | null };
}): CrmNoteItem => ({
  id: row.id,
  body: row.body,
  visibility: row.visibility,
  authorUserId: row.authorUserId,
  authorName: formatPersonName(row.author.name, row.author.surname),
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
    payments: Parameters<typeof mapPaymentItem>[0][];
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
  payments: row.payments.map(mapPaymentItem),
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
  builderCompany: {
    id: string;
    name: string;
    logoMedia: { fileUrl: string } | null;
  };
  project: {
    name: string;
    coverMedia: { fileUrl: string; thumbnailUrl: string | null } | null;
  } | null;
  crmDeal: { id: string; status: CrmDealStatus } | null;
}): BuyerRequestListItem => ({
  requestId: row.id,
  dealId: row.crmDeal?.id ?? null,
  source: row.source,
  buyerStatus: mapDealStatusToBuyerFacing(row.crmDeal?.status ?? ('new_request' as CrmDealStatus)),
  builderCompanyId: row.builderCompany.id,
  builderCompanyName: row.builderCompany.name,
  builderLogoUrl: row.builderCompany.logoMedia?.fileUrl ?? null,
  projectId: row.projectId,
  projectName: row.project?.name ?? null,
  projectCoverUrl:
    row.project?.coverMedia?.thumbnailUrl ?? row.project?.coverMedia?.fileUrl ?? null,
  apartmentId: row.apartmentId,
  note: row.note,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});
