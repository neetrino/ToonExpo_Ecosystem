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
 * Inserts one audit row. Never throws — product mutations must not fail solely
 * because audit write failed. Prefer calling inside the same `$transaction` as
 * the status change so successful writes commit atomically with the mutation.
 */
export async function recordAudit(
  client: AuditWriteClient,
  input: RecordAuditInput,
): Promise<void> {
  try {
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
  } catch {
    // Audit must never break mutations.
  }
}
