import { Injectable } from '@nestjs/common';
import type {
  CompanyProfileUpdateInput,
  MediaAssetIdInput,
  MediaAssetUpsertInput,
} from '@toonexpo/contracts';
import type { Prisma, PrismaClient } from '@toonexpo/db';

import { type PrismaService } from '../../common/prisma.service';
import { type R2DeleteService } from '../uploads/r2-delete.service';
import type { BuilderMutationResult } from './builder-mutation.types';

type Tx = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class BuilderMediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: R2DeleteService,
  ) {}

  async updateCompany(
    companyId: string,
    input: CompanyProfileUpdateInput,
  ): Promise<BuilderMutationResult<{ companyId: string; companySlug: string }>> {
    const existing = await this.prisma.client.company.findUnique({
      where: { id: companyId },
      select: { logoUrl: true, slug: true },
    });
    if (!existing) return { ok: false, errorKey: 'notFound' };
    await this.prisma.client.company.update({
      where: { id: companyId },
      data: {
        name: input.name,
        description: input.description ?? null,
        logoUrl: input.logoUrl ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        website: input.website ?? null,
        city: input.city ?? null,
        address: input.address ?? null,
      },
    });
    await this.r2.deleteReplaced(existing.logoUrl, input.logoUrl ?? null);
    return { ok: true, companyId, companySlug: existing.slug };
  }

  add(companyId: string, input: MediaAssetUpsertInput) {
    return this.prisma.client.$transaction(async (tx) => {
      if (input.projectId) {
        const project = await tx.project.findFirst({
          where: { id: input.projectId, companyId },
          select: { id: true },
        });
        if (!project) return { ok: false as const, errorKey: 'notFound' as const };
        const asset = await tx.mediaAsset.create({
          data: mediaData(input, { projectId: project.id }),
          select: { id: true },
        });
        return { ok: true as const, mediaAssetId: asset.id };
      }
      const apartment = await tx.apartment.findFirst({
        where: { id: input.apartmentId, floor: { building: { project: { companyId } } } },
        select: { id: true },
      });
      if (!apartment) return { ok: false as const, errorKey: 'notFound' as const };
      const asset = await tx.mediaAsset.create({
        data: mediaData(input, { apartmentId: apartment.id }),
        select: { id: true },
      });
      return { ok: true as const, mediaAssetId: asset.id };
    });
  }

  update(companyId: string, input: MediaAssetUpsertInput & { mediaAssetId: string }) {
    return this.prisma.client.$transaction(async (tx) => {
      const owned = await findOwned(tx, companyId, input.mediaAssetId);
      if (!owned) return { ok: false as const, errorKey: 'notFound' as const };
      await tx.mediaAsset.update({
        where: { id: input.mediaAssetId },
        data: { url: input.url, alt: input.alt ?? null, sortOrder: input.sortOrder },
      });
      return { ok: true as const, mediaAssetId: input.mediaAssetId };
    });
  }

  async remove(companyId: string, input: MediaAssetIdInput) {
    const url = await this.prisma.client.$transaction(async (tx) => {
      const owned = await findOwned(tx, companyId, input.mediaAssetId);
      if (!owned) return null;
      await tx.mediaAsset.delete({ where: { id: input.mediaAssetId } });
      return owned.url;
    });
    if (!url) return { ok: false as const, errorKey: 'notFound' as const };
    await this.r2.delete(url);
    return { ok: true as const, mediaAssetId: input.mediaAssetId };
  }
}

function ownedWhere(companyId: string, id: string): Prisma.MediaAssetWhereInput {
  return {
    id,
    OR: [
      { project: { companyId } },
      { apartment: { floor: { building: { project: { companyId } } } } },
    ],
  };
}

function findOwned(tx: Tx, companyId: string, id: string) {
  return tx.mediaAsset.findFirst({
    where: ownedWhere(companyId, id),
    select: { url: true },
  });
}

function mediaData(
  input: MediaAssetUpsertInput,
  owner: { projectId: string } | { apartmentId: string },
) {
  return { ...owner, url: input.url, alt: input.alt ?? null, sortOrder: input.sortOrder };
}
