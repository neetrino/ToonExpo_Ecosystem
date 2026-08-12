/**
 * BOS inbound integration contracts.
 * Wire payloads use snake_case per integration spec; admin views use camelCase.
 */

import type { PaginatedResponse } from './catalog.js';

/** Module keys accepted on the BOS provisioning request. */
export type BosRequestedModule =
  | 'builder_portal'
  | 'constructor_crm'
  | 'readiness'
  | 'partner_profile'
  | 'bank_offers'
  | 'analytics';

export type BosProvisioningCompanyType = 'builder' | 'partner' | 'bank';

/** Stored lifecycle status (includes internal partial for retry). */
export type BosProvisioningStatus = 'success' | 'linked_existing' | 'failed' | 'partial';

/** Status returned to BOS (partial is mapped to failed with retry hint). */
export type BosProvisioningWireStatus = 'success' | 'linked_existing' | 'failed';

export type IntegrationAuditAction =
  | 'provisioning_received'
  | 'company_created'
  | 'company_linked'
  | 'user_created'
  | 'user_linked'
  | 'member_created'
  | 'invitation_sent'
  | 'provisioning_failed'
  | 'provisioning_retried'
  | 'result_returned';

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
  errorMessage: string | null;
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminBosProvisioningListResponse = PaginatedResponse<AdminBosProvisioningListItem>;

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

export const VENUE_MAP_SNAPSHOT_SCHEMA_VERSION = 'venue-map.v1' as const;

export type VenueMapSnapshotSchemaVersion = typeof VENUE_MAP_SNAPSHOT_SCHEMA_VERSION;

export type VenueMapPublicDisplayMode = 'organization' | 'custom_label' | 'hidden';

export type VenueMapPublishStatus =
  | 'published'
  | 'already_published'
  | 'rejected'
  | 'failed';

export type VenueMapSnapshotOccupant = {
  toonexpo_company_id?: string;
  organization_name: string;
};

export type VenueMapSnapshotCell = {
  x: number;
  y: number;
};

export type VenueMapSnapshotArea = {
  code: string;
  name?: string;
  square_meters: number;
  cells: VenueMapSnapshotCell[];
  public_display_mode: VenueMapPublicDisplayMode;
  occupant?: VenueMapSnapshotOccupant;
  custom_label?: string;
};

export type VenueMapSnapshotBackground = {
  url: string;
  width: number;
  height: number;
  pixels_per_meter: number;
  grid_origin_x: number;
  grid_origin_y: number;
};

export type VenueMapSnapshotContent = {
  title: string;
  background: VenueMapSnapshotBackground;
  areas: VenueMapSnapshotArea[];
};

/** BOS POST /integrations/bos/venue-map/publish request (snake_case wire format). */
export type VenueMapPublishRequestBody = {
  request_id: string;
  schema_version: VenueMapSnapshotSchemaVersion;
  bos_venue_plan_id: string;
  bos_event_cycle_id: string;
  bos_event_cycle_code: string;
  snapshot_version: number;
  checksum: string;
  published_at: string;
  content: VenueMapSnapshotContent;
};

/** BOS venue-map publication response (snake_case wire format). */
export type VenueMapPublishResponse = {
  request_id: string;
  bos_venue_plan_id: string;
  accepted_snapshot_version: number;
  toonexpo_snapshot_id: string | null;
  status: VenueMapPublishStatus;
  validation_errors?: string[];
  activated_at?: string;
};
