/**
 * BOS inbound integration contracts.
 * Wire payloads use snake_case per integration spec; admin views use camelCase.
 */

import type { PaginatedResponse } from "./catalog.js";

/** Module keys accepted on the BOS provisioning request. */
export type BosRequestedModule =
  | "builder_portal"
  | "constructor_crm"
  | "readiness"
  | "partner_profile"
  | "bank_offers"
  | "analytics";

export type BosProvisioningCompanyType = "builder" | "partner" | "bank";

/** Stored lifecycle status (includes internal partial for retry). */
export type BosProvisioningStatus =
  | "success"
  | "linked_existing"
  | "failed"
  | "partial";

/** Status returned to BOS (partial is mapped to failed with retry hint). */
export type BosProvisioningWireStatus = "success" | "linked_existing" | "failed";

export type IntegrationAuditAction =
  | "provisioning_received"
  | "company_created"
  | "company_linked"
  | "user_created"
  | "user_linked"
  | "member_created"
  | "invitation_sent"
  | "provisioning_failed"
  | "provisioning_retried"
  | "result_returned";

/** BOS POST /integrations/bos/provisioning request (snake_case wire format). */
export type BosProvisioningRequestBody = {
  request_id: string;
  bos_company_id: string;
  company_name: string;
  company_type: BosProvisioningCompanyType;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone?: string;
  event_cycle_id?: string;
  event_cycle_name?: string;
  requested_modules: BosRequestedModule[];
};

/** BOS provisioning response (snake_case wire format). */
export type BosProvisioningResponse = {
  request_id: string;
  toonexpo_company_id: string | null;
  primary_user_id: string | null;
  status: BosProvisioningWireStatus;
  error_message?: string;
  created_at: string;
};

export type AdminBosProvisioningListItem = {
  id: string;
  requestId: string;
  bosCompanyId: string;
  companyName: string;
  companyType: BosProvisioningCompanyType;
  primaryContactEmail: string;
  status: BosProvisioningStatus;
  toonexpoCompanyId: string | null;
  primaryUserId: string | null;
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminBosProvisioningListResponse =
  PaginatedResponse<AdminBosProvisioningListItem>;

export type IntegrationAuditLogItem = {
  id: string;
  action: IntegrationAuditAction;
  details: Record<string, unknown> | null;
  createdAt: string;
};

export type AdminBosProvisioningDetail = AdminBosProvisioningListItem & {
  primaryContactName: string;
  primaryContactPhone: string | null;
  eventCycleId: string | null;
  eventCycleName: string | null;
  requestedModules: BosRequestedModule[];
  errorMessage: string | null;
  auditLogs: IntegrationAuditLogItem[];
};
