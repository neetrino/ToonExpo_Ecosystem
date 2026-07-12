import type { IntegrationAuditStatus, IntegrationDirection } from '@toonexpo/domain';
import { prisma } from '@toonexpo/db';

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
  return prisma.integrationAuditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      direction: true,
      operation: true,
      status: true,
      externalRef: true,
      createdAt: true,
    },
  });
}
