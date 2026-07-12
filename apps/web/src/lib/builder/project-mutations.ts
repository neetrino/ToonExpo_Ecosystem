import type { ProjectPublicationInput, ProjectUpsertInput } from '@toonexpo/contracts';
import { slugifyCompanyName } from '@toonexpo/contracts';
import { prisma, Prisma } from '@toonexpo/db';

import {
  type AuditActor,
  formatStatusTransition,
  recordAudit,
} from '@/lib/audit/record-audit';
import { allocateUniqueSlug } from '@/lib/shared/unique-slug';

import { type BuilderMutationResult, UNIQUE_CONSTRAINT_ERROR } from './mutation-result';

export async function createProject(
  companyId: string,
  input: ProjectUpsertInput,
): Promise<BuilderMutationResult<{ projectId: string; projectSlug: string }>> {
  const baseSlug = slugifyCompanyName(input.name);

  try {
    const slug = await allocateUniqueSlug(baseSlug, async (candidate) => {
      const existing = await prisma.project.findUnique({
        where: { companyId_slug: { companyId, slug: candidate } },
      });
      return existing !== null;
    });

    if (!slug) {
      return { ok: false, errorKey: 'invalidInput' };
    }

    const project = await prisma.project.create({
      data: {
        companyId,
        name: input.name,
        slug,
        city: input.city,
        address: input.address,
        description: input.description,
      },
      select: { id: true, slug: true },
    });

    return { ok: true, projectId: project.id, projectSlug: project.slug };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_ERROR
    ) {
      return { ok: false, errorKey: 'nameTaken' };
    }
    throw error;
  }
}

export async function updateProject(
  companyId: string,
  input: ProjectUpsertInput & { projectId: string },
): Promise<BuilderMutationResult<{ projectId: string }>> {
  const result = await prisma.project.updateMany({
    where: { id: input.projectId, companyId },
    data: {
      name: input.name,
      city: input.city,
      address: input.address,
      description: input.description,
    },
  });

  if (result.count === 0) {
    return { ok: false, errorKey: 'notFound' };
  }

  return { ok: true, projectId: input.projectId };
}

/**
 * Builder publication change — audit written inside the same transaction (atomic).
 */
export async function setProjectPublication(
  companyId: string,
  input: ProjectPublicationInput,
  actor: AuditActor,
): Promise<BuilderMutationResult<{ projectId: string }>> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.project.findFirst({
      where: { id: input.projectId, companyId },
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
