/**
 * CRM Lead Intake + Constructor CRM contracts.
 */

import type { PaginatedResponse } from "./catalog.js";

/** Canonical unified intake sources (DECISIONS + Status Enums). */
export type RequestSource =
  | "buyer_project_request"
  | "builder_buyer_qr_scan"
  | "manual_builder_entry"
  | "event_interaction";

/** Intake request lifecycle (deal owns the sales pipeline). */
export type RequestStatus = "submitted" | "attached" | "cancelled";

/** Constructor CRM pipeline status. */
export type CrmDealStatus =
  | "new_request"
  | "assigned"
  | "contacted"
  | "follow_up_needed"
  | "apartment_selected"
  | "reserved"
  | "converted"
  | "closed"
  | "lost";

/** Buyer-facing status (mapped from CrmDealStatus; no internal CRM details). */
export type BuyerFacingRequestStatus =
  | "request_sent"
  | "builder_received"
  | "in_contact"
  | "apartment_selected"
  | "reserved"
  | "closed"
  | "cancelled";

export type CrmDealApartmentLinkType =
  | "interest"
  | "selected"
  | "reserved"
  | "sold";

export type CrmNoteVisibility = "internal";

export type CrmActivityType =
  | "call"
  | "email"
  | "meeting"
  | "send_offer"
  | "follow_up"
  | "status_update"
  | "other";

export type CrmActivityStatus = "planned" | "done" | "cancelled";

export type CreateBuyerRequestBody = {
  projectId: string;
  apartmentId?: string;
  note?: string;
};

export type CreateDealFromScanBody = {
  scanEventId: string;
  projectId?: string;
  apartmentId?: string;
  note?: string;
};

export type CreateManualDealBody = {
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  projectId?: string;
  apartmentId?: string;
  note?: string;
};

export type IntakeCreateResult = {
  requestId: string;
  dealId: string;
  deduplicated: boolean;
  dealStatus: CrmDealStatus;
  source: RequestSource;
};

export type CrmBuyerContact = {
  buyerProfileId: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
};

export type CrmDealListItem = {
  id: string;
  status: CrmDealStatus;
  source: RequestSource;
  projectId: string | null;
  projectName: string | null;
  buyer: CrmBuyerContact;
  assignedUserId: string | null;
  assignedUserName: string | null;
  lastActivityAt: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CrmDealListResponse = PaginatedResponse<CrmDealListItem>;

export type CrmRequestHistoryItem = {
  id: string;
  source: RequestSource;
  note: string | null;
  projectId: string | null;
  apartmentId: string | null;
  scanEventId: string | null;
  createdAt: string;
};

export type CrmApartmentLinkItem = {
  id: string;
  apartmentId: string;
  apartmentNumber: string | null;
  linkType: CrmDealApartmentLinkType;
  isPrimary: boolean;
  createdAt: string;
};

export type CrmNoteItem = {
  id: string;
  body: string;
  visibility: CrmNoteVisibility;
  authorUserId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

export type CrmActivityItem = {
  id: string;
  type: CrmActivityType;
  title: string;
  description: string | null;
  dueAt: string | null;
  status: CrmActivityStatus;
  assignedUserId: string | null;
  completedAt: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type CrmDealDetail = CrmDealListItem & {
  message: string | null;
  lostReason: string | null;
  primaryRequestId: string | null;
  requests: CrmRequestHistoryItem[];
  apartments: CrmApartmentLinkItem[];
  notes: CrmNoteItem[];
  activities: CrmActivityItem[];
};

export type UpdateCrmDealBody = {
  status?: CrmDealStatus;
  assignedUserId?: string | null;
  lostReason?: string;
  projectId?: string | null;
};

export type AttachCrmDealApartmentBody = {
  apartmentId: string;
};

export type CreateCrmNoteBody = {
  body: string;
};

export type CreateCrmActivityBody = {
  type: CrmActivityType;
  title: string;
  description?: string;
  dueAt?: string;
  assignedUserId?: string;
};

export type UpdateCrmActivityBody = {
  status?: CrmActivityStatus;
  title?: string;
  description?: string | null;
  dueAt?: string | null;
  assignedUserId?: string | null;
};

export type BuyerRequestListItem = {
  requestId: string;
  dealId: string | null;
  source: RequestSource;
  buyerStatus: BuyerFacingRequestStatus;
  builderCompanyId: string;
  builderCompanyName: string;
  projectId: string | null;
  projectName: string | null;
  apartmentId: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BuyerRequestListResponse = PaginatedResponse<BuyerRequestListItem>;
