import type { AuditAction, AuditEntityType, PlatformRole } from '@toonexpo/domain';

export type AuditActor = {
  userId: string;
  role: PlatformRole;
};

export type RecordAuditInput = {
  actor: AuditActor;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  companyId?: string | null;
  detail?: string | null;
};

/** Prisma client or interactive transaction client with `auditLog.create`. */
export type AuditWriteClient = {
  auditLog: {
    create: (args: {
      data: {
        actorUserId: string;
        actorRole: PlatformRole;
        action: AuditAction;
        entityType: AuditEntityType;
        entityId: string;
        companyId?: string | null;
        detail?: string | null;
      };
    }) => Promise<unknown>;
  };
};

/**
 * Formats a status transition for AuditLog.detail (e.g. DRAFT→PUBLISHED).
 */
export function formatStatusTransition(from: string, to: string): string {
  return `${from}→${to}`;
}

/**
 * Inserts one audit row inside the caller's transaction/client.
 * Failures propagate so the mutation rolls back — auditability is required.
 * Callers must pass the same interactive `tx` as the mutation.
 * BOS inbound integration audit uses a separate post-commit never-throw helper.
 */
export async function recordAudit(
  client: AuditWriteClient,
  input: RecordAuditInput,
): Promise<void> {
  await client.auditLog.create({
    data: {
      actorUserId: input.actor.userId,
      actorRole: input.actor.role,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      companyId: input.companyId ?? null,
      detail: input.detail ?? null,
    },
  });
}
