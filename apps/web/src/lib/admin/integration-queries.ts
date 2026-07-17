import type { IntegrationAuditStatus, IntegrationDirection } from '@toonexpo/domain';

import { adminApiRequest } from './admin-api';

export const INTEGRATION_AUDIT_LOG_LIMIT = 100;

export type IntegrationAuditLogRow = {
  id: string;
  direction: IntegrationDirection;
  operation: string;
  status: IntegrationAuditStatus;
  externalRef: string | null;
  createdAt: Date;
};

/** Latest integration audit rows for admin visibility (narrow select, no payload). */
export async function loadIntegrationAuditLogs(
  limit: number = INTEGRATION_AUDIT_LOG_LIMIT,
): Promise<IntegrationAuditLogRow[]> {
  const rows = await adminApiRequest<IntegrationAuditLogRow[]>('/integrations');
  return rows.slice(0, limit);
}
