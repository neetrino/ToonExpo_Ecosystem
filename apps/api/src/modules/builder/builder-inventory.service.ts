import { Injectable } from '@nestjs/common';
import type {
  ApartmentUpsertInput,
  BuildingCreateInput,
  BuildingPublicationInput,
  BuildingUpdateInput,
  FloorCreateInput,
  FloorPublicationInput,
  FloorUpdateInput,
} from '@toonexpo/contracts';
import { Prisma } from '@toonexpo/db';

import { PrismaService } from '../../common/prisma.service';
import {
  type AuditActor,
  type BuilderMutationResult,
  recordPublicationAudit,
  UNIQUE_CONSTRAINT_ERROR,
} from './builder-mutation.types';

@Injectable()
export class BuilderInventoryService {
  constructor(private readonly prisma: PrismaService) {}

  createBuilding(companyId: string, input: BuildingCreateInput) {
    return this.prisma.client.$transaction(async (tx) => {
      const project = await tx.project.findFirst({
        where: { id: input.projectId, companyId },
        select: { id: true },
      });
      if (!project) return { ok: false as const, errorKey: 'notFound' as const };
      const building = await tx.building.create({
        data: { projectId: project.id, name: input.name, status: 'DRAFT' },
        select: { id: true },
      });
      return { ok: true as const, buildingId: building.id };
    });
  }

  async updateBuilding(companyId: string, input: BuildingUpdateInput) {
    const result = await this.prisma.client.building.updateMany({
      where: { id: input.buildingId, project: { companyId } },
      data: { name: input.name, description: input.description ?? null },
    });
    return result.count
      ? { ok: true as const, buildingId: input.buildingId }
      : { ok: false as const, errorKey: 'notFound' as const };
  }

  publishBuilding(companyId: string, input: BuildingPublicationInput, actor: AuditActor) {
    return this.prisma.client.$transaction(async (tx) => {
      const existing = await tx.building.findFirst({
        where: { id: input.buildingId, project: { companyId } },
        select: { id: true, status: true, project: { select: { companyId: true } } },
      });
      if (!existing) return { ok: false as const, errorKey: 'notFound' as const };
      await tx.building.update({ where: { id: existing.id }, data: { status: input.status } });
      await recordPublicationAudit(tx, actor, {
        type: 'BUILDING',
        id: existing.id,
        companyId: existing.project.companyId,
        from: existing.status,
        to: input.status,
      });
      return { ok: true as const, buildingId: existing.id };
    });
  }

  async createFloor(
    companyId: string,
    input: FloorCreateInput,
  ): Promise<BuilderMutationResult<{ floorId: string }>> {
    try {
      return await this.prisma.client.$transaction(async (tx) => {
        const building = await tx.building.findFirst({
          where: { id: input.buildingId, project: { companyId } },
          select: { id: true },
        });
        if (!building) return { ok: false, errorKey: 'notFound' };
        const floor = await tx.floor.create({
          data: {
            buildingId: building.id,
            name: input.name,
            level: input.level,
            status: 'DRAFT',
          },
          select: { id: true },
        });
        return { ok: true, floorId: floor.id };
      });
    } catch (error) {
      return mapUnique<{ floorId: string }>(error, 'levelTaken');
    }
  }

  async updateFloor(
    companyId: string,
    input: FloorUpdateInput,
  ): Promise<BuilderMutationResult<{ floorId: string }>> {
    try {
      const result = await this.prisma.client.floor.updateMany({
        where: { id: input.floorId, building: { project: { companyId } } },
        data: { name: input.name, level: input.level },
      });
      return result.count
        ? { ok: true, floorId: input.floorId }
        : { ok: false, errorKey: 'notFound' };
    } catch (error) {
      return mapUnique<{ floorId: string }>(error, 'levelTaken');
    }
  }

  publishFloor(companyId: string, input: FloorPublicationInput, actor: AuditActor) {
    return this.prisma.client.$transaction(async (tx) => {
      const existing = await tx.floor.findFirst({
        where: { id: input.floorId, building: { project: { companyId } } },
        select: {
          id: true,
          status: true,
          building: { select: { project: { select: { companyId: true } } } },
        },
      });
      if (!existing) return { ok: false as const, errorKey: 'notFound' as const };
      await tx.floor.update({ where: { id: existing.id }, data: { status: input.status } });
      await recordPublicationAudit(tx, actor, {
        type: 'FLOOR',
        id: existing.id,
        companyId: existing.building.project.companyId,
        from: existing.status,
        to: input.status,
      });
      return { ok: true as const, floorId: existing.id };
    });
  }

  async upsertApartment(
    companyId: string,
    input: ApartmentUpsertInput,
    actorUserId: string,
  ): Promise<BuilderMutationResult<{ apartmentId: string }>> {
    try {
      return await this.prisma.client.$transaction(async (tx) => {
        const floor = await tx.floor.findFirst({
          where: { id: input.floorId, building: { project: { companyId } } },
          select: { id: true },
        });
        if (!floor) return { ok: false, errorKey: 'notFound' };
        if (!input.apartmentId) {
          const created = await tx.apartment.create({
            data: apartmentData(input, floor.id),
            select: { id: true },
          });
          return { ok: true, apartmentId: created.id };
        }
        const existing = await tx.apartment.findFirst({
          where: { id: input.apartmentId, floor: { building: { project: { companyId } } } },
          select: { id: true, status: true },
        });
        if (!existing) return { ok: false, errorKey: 'notFound' };
        await tx.apartment.update({
          where: { id: existing.id },
          data: apartmentData(input, floor.id),
        });
        if (existing.status !== input.status) {
          await tx.apartmentStatusHistory.create({
            data: {
              apartmentId: existing.id,
              dealId: null,
              source: 'MANUAL_INVENTORY',
              oldStatus: existing.status,
              newStatus: input.status,
              changedByUserId: actorUserId,
              reason: null,
            },
          });
        }
        return { ok: true, apartmentId: existing.id };
      });
    } catch (error) {
      return mapUnique<{ apartmentId: string }>(error, 'codeTaken');
    }
  }
}

function apartmentData(input: ApartmentUpsertInput, floorId: string) {
  return {
    floorId,
    code: input.code,
    rooms: input.rooms,
    areaSqm: input.areaSqm,
    priceAmd: input.priceAmd,
    priceVisibility: input.priceVisibility,
    matterportUrl: input.matterportUrl ?? null,
    status: input.status,
  };
}

function mapUnique<T extends Record<string, unknown>>(
  error: unknown,
  errorKey: 'levelTaken' | 'codeTaken',
): BuilderMutationResult<T> {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === UNIQUE_CONSTRAINT_ERROR
  ) {
    return { ok: false, errorKey };
  }
  throw error;
}
