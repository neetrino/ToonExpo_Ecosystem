import type { ProjectPublicationInput } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';

import {
  type AuditActor,
  formatStatusTransition,
  recordAudit,
} from '@/lib/audit/record-audit';

import type { AdminMutationResult } from './mutation-result';

/**
 * Admin publication change — audit written inside the same transaction (atomic).
 */
export async function setProjectPublicationAsAdmin(
  input: ProjectPublicationInput,
  actor: AuditActor,
): Promise<AdminMutationResult<{ projectId: string }>> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.project.findUnique({
      where: { id: input.projectId },
      select: { id: true, status: true, companyId: true },
    });
    if (!existing) {
      return { ok: false, errorKey: 'notFound' };
    }

    await tx.project.update({
      where: { id: existing.id },
      data: { status: input.status },
    });

    await recordAudit(tx, {
      actor,
      action: 'PUBLICATION_CHANGE',
      entityType: 'PROJECT',
      entityId: existing.id,
      companyId: existing.companyId,
      detail: formatStatusTransition(existing.status, input.status),
    });

    return { ok: true, projectId: existing.id };
  });
}
