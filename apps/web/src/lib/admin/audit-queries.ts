import { AUDIT_ENTITY_TYPES, type AuditAction, type AuditEntityType } from '@toonexpo/domain';
import { z } from 'zod';

import { adminApiRequest } from './admin-api';

export const AUDIT_LOG_PAGE_LIMIT = 200;

const entityTypeSchema = z.enum(AUDIT_ENTITY_TYPES);

/** Validates an optional entityType query param; invalid values become undefined. */
export function parseAuditEntityTypeFilter(
  raw: string | null | undefined,
): AuditEntityType | undefined {
  if (!raw) {
    return undefined;
  }
  const parsed = entityTypeSchema.safeParse(raw);
  return parsed.success ? parsed.data : undefined;
}

export type AuditLogRow = {
  id: string;
  actorEmail: string | null;
  actorName: string | null;
  actorRole: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  detail: string | null;
  createdAt: Date;
};

/** Latest platform audit rows for admin (narrow join on actor email/name). */
export async function loadAuditLogs(
  entityType?: AuditEntityType,
  limit: number = AUDIT_LOG_PAGE_LIMIT,
): Promise<AuditLogRow[]> {
  const query = entityType ? `?entityType=${encodeURIComponent(entityType)}` : '';
  const rows = await adminApiRequest<AuditLogRow[]>(`/audit${query}`);
  return rows.slice(0, limit);
}
