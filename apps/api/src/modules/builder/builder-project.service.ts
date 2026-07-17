import { Injectable } from '@nestjs/common';
import type { ProjectPublicationInput, ProjectUpsertInput } from '@toonexpo/contracts';
import { slugifyCompanyName } from '@toonexpo/contracts';
import { Prisma } from '@toonexpo/db';

import { PrismaService } from '../../common/prisma.service';
import {
  type AuditActor,
  type BuilderMutationResult,
  MAX_SLUG_ATTEMPTS,
  recordPublicationAudit,
  UNIQUE_CONSTRAINT_ERROR,
} from './builder-mutation.types';

@Injectable()
export class BuilderProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    companyId: string,
    input: ProjectUpsertInput,
  ): Promise<BuilderMutationResult<{ projectId: string; projectSlug: string }>> {
    try {
      const slug = await this.allocateSlug(companyId, slugifyCompanyName(input.name));
      if (!slug) return { ok: false, errorKey: 'invalidInput' };
      const project = await this.prisma.client.project.create({
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
      if (isUniqueError(error)) return { ok: false, errorKey: 'nameTaken' };
      throw error;
    }
  }

  async update(
    companyId: string,
    input: ProjectUpsertInput & { projectId: string },
  ): Promise<BuilderMutationResult<{ projectId: string }>> {
    const result = await this.prisma.client.project.updateMany({
      where: { id: input.projectId, companyId },
      data: {
        name: input.name,
        city: input.city,
        address: input.address,
        description: input.description,
      },
    });
    return result.count
      ? { ok: true, projectId: input.projectId }
      : { ok: false, errorKey: 'notFound' };
  }

  publish(
    companyId: string,
    input: ProjectPublicationInput,
    actor: AuditActor,
  ): Promise<BuilderMutationResult<{ projectId: string }>> {
    return this.prisma.client.$transaction(async (tx) => {
      const existing = await tx.project.findFirst({
        where: { id: input.projectId, companyId },
        select: { id: true, status: true, companyId: true },
      });
      if (!existing) return { ok: false, errorKey: 'notFound' };
      await tx.project.update({ where: { id: existing.id }, data: { status: input.status } });
      await recordPublicationAudit(tx, actor, {
        type: 'PROJECT',
        id: existing.id,
        companyId: existing.companyId,
        from: existing.status,
        to: input.status,
      });
      return { ok: true, projectId: existing.id };
    });
  }

  private async allocateSlug(companyId: string, base: string): Promise<string | null> {
    for (let index = 0; index < MAX_SLUG_ATTEMPTS; index += 1) {
      const candidate = index === 0 ? base : `${base}-${index + 1}`;
      const existing = await this.prisma.client.project.findUnique({
        where: { companyId_slug: { companyId, slug: candidate } },
        select: { id: true },
      });
      if (!existing) return candidate;
    }
    return null;
  }
}

function isUniqueError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_CONSTRAINT_ERROR
  );
}
