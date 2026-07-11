import type { ProjectPublicationInput, ProjectUpsertInput } from '@toonexpo/contracts';
import { slugifyCompanyName } from '@toonexpo/contracts';
import { prisma, Prisma } from '@toonexpo/db';

import { allocateUniqueSlug } from '@/lib/shared/unique-slug';

import { type BuilderMutationResult, UNIQUE_CONSTRAINT_ERROR } from './mutation-result';

export async function createProject(
  companyId: string,
  input: ProjectUpsertInput,
): Promise<BuilderMutationResult<{ projectId: string }>> {
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
      select: { id: true },
    });

    return { ok: true, projectId: project.id };
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

export async function setProjectPublication(
  companyId: string,
  input: ProjectPublicationInput,
): Promise<BuilderMutationResult<{ projectId: string }>> {
  const result = await prisma.project.updateMany({
    where: { id: input.projectId, companyId },
    data: { status: input.status },
  });

  if (result.count === 0) {
    return { ok: false, errorKey: 'notFound' };
  }

  return { ok: true, projectId: input.projectId };
}
