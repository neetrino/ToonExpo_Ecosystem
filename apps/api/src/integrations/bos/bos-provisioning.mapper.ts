import type {
  AdminBosProvisioningDetail,
  AdminBosProvisioningListItem,
  BosProvisioningResponse,
  BosProvisioningStatus,
  BosProvisioningWireStatus,
  IntegrationAuditLogItem,
} from '@toonexpo/contracts';
import type { Prisma } from '@toonexpo/db';

type BosProvisioningRecord = Prisma.BosProvisioningRequestGetPayload<object>;
type IntegrationAuditRecord = Prisma.IntegrationAuditLogGetPayload<object>;

const toWireStatus = (status: BosProvisioningStatus): BosProvisioningWireStatus => {
  if (status === 'partial') {
    return 'failed';
  }
  return status;
};

export const toBosProvisioningResponse = (
  record: BosProvisioningRecord,
): BosProvisioningResponse => ({
  request_id: record.requestId,
  toonexpo_company_id: record.toonexpoCompanyId,
  primary_user_id: record.primaryUserId,
  status: toWireStatus(record.status),
  ...(record.errorMessage ? { error_message: record.errorMessage } : {}),
  created_at: record.createdAt.toISOString(),
});

export const toAdminBosProvisioningListItem = (
  record: BosProvisioningRecord,
): AdminBosProvisioningListItem => ({
  id: record.id,
  requestId: record.requestId,
  bosCompanyId: record.bosCompanyId,
  companyName: record.companyName,
  companyType: record.companyType,
  primaryContactEmail: record.primaryContactEmail,
  status: record.status,
  toonexpoCompanyId: record.toonexpoCompanyId,
  primaryUserId: record.primaryUserId,
  errorMessage: record.errorMessage,
  attemptCount: record.attemptCount,
  createdAt: record.createdAt.toISOString(),
  updatedAt: record.updatedAt.toISOString(),
});

export const toIntegrationAuditLogItem = (
  row: IntegrationAuditRecord,
): IntegrationAuditLogItem => ({
  id: row.id,
  action: row.action,
  details:
    row.details && typeof row.details === 'object' && !Array.isArray(row.details)
      ? (row.details as Record<string, unknown>)
      : null,
  createdAt: row.createdAt.toISOString(),
});

export const toAdminBosProvisioningDetail = (
  record: BosProvisioningRecord,
  auditLogs: IntegrationAuditRecord[],
): AdminBosProvisioningDetail => ({
  ...toAdminBosProvisioningListItem(record),
  primaryContactName: record.primaryContactName,
  primaryContactPhone: record.primaryContactPhone,
  eventCycleId: record.eventCycleId,
  eventCycleName: record.eventCycleName,
  requestedModules: record.requestedModules as AdminBosProvisioningDetail['requestedModules'],
  errorMessage: record.errorMessage,
  auditLogs: auditLogs.map(toIntegrationAuditLogItem),
});
