import { AUDIT_ENTITY_TYPES, type AuditAction, type AuditEntityType } from '@toonexpo/domain';
import { prisma } from '@toonexpo/db';
import { z } from 'zod';

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
  const rows = await prisma.auditLog.findMany({
    where: entityType ? { entityType } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      actorRole: true,
      action: true,
      entityType: true,
      entityId: true,
      detail: true,
      createdAt: true,
      actorUser: { select: { email: true, name: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    actorEmail: row.actorUser.email,
    actorName: row.actorUser.name,
    actorRole: row.actorRole,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    detail: row.detail,
    createdAt: row.createdAt,
  }));
}
