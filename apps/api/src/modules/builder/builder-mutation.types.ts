import type { PlatformRole } from '@toonexpo/domain';

export const UNIQUE_CONSTRAINT_ERROR = 'P2002';
export const MAX_SLUG_ATTEMPTS = 100;

export type BuilderMutationErrorKey =
  | 'unauthorized'
  | 'notFound'
  | 'invalidInput'
  | 'levelTaken'
  | 'codeTaken'
  | 'nameTaken';

export type BuilderMutationResult<T extends Record<string, unknown> = Record<string, never>> =
  | ({ ok: true } & T)
  | { ok: false; errorKey: BuilderMutationErrorKey };

export type AuditActor = { userId: string; role: PlatformRole };

export type AuditClient = {
  auditLog: {
    create(args: {
      data: {
        actorUserId: string;
        actorRole: PlatformRole;
        action: 'PUBLICATION_CHANGE';
        entityType: 'PROJECT' | 'BUILDING' | 'FLOOR';
        entityId: string;
        companyId: string;
        detail: string;
      };
    }): Promise<unknown>;
  };
};

export function recordPublicationAudit(
  client: AuditClient,
  actor: AuditActor,
  entity: {
    type: 'PROJECT' | 'BUILDING' | 'FLOOR';
    id: string;
    companyId: string;
    from: string;
    to: string;
  },
): Promise<unknown> {
  return client.auditLog.create({
    data: {
      actorUserId: actor.userId,
      actorRole: actor.role,
      action: 'PUBLICATION_CHANGE',
      entityType: entity.type,
      entityId: entity.id,
      companyId: entity.companyId,
      detail: `${entity.from}→${entity.to}`,
    },
  });
}
