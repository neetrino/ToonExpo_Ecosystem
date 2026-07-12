import type { ApartmentUpsertInput } from '@toonexpo/contracts';
import { prisma, Prisma } from '@toonexpo/db';

import { recordApartmentStatusHistory } from '../shared/apartment-status-history';

import { type BuilderMutationResult, UNIQUE_CONSTRAINT_ERROR } from './mutation-result';

export async function createApartment(
  companyId: string,
  input: ApartmentUpsertInput,
): Promise<BuilderMutationResult<{ apartmentId: string }>> {
  try {
    return await prisma.$transaction(async (tx) => {
      const floor = await tx.floor.findFirst({
        where: { id: input.floorId, building: { project: { companyId } } },
        select: { id: true },
      });
      if (!floor) {
        return { ok: false, errorKey: 'notFound' };
      }

      const apartment = await tx.apartment.create({
        data: {
          floorId: floor.id,
          code: input.code,
          rooms: input.rooms,
          areaSqm: input.areaSqm,
          priceAmd: input.priceAmd,
          priceVisibility: input.priceVisibility,
          matterportUrl: input.matterportUrl ?? null,
          status: input.status,
        },
        select: { id: true },
      });
      return { ok: true, apartmentId: apartment.id };
    });
  } catch (error) {
    return mapApartmentUniqueError(error);
  }
}

export async function updateApartment(
  companyId: string,
  input: ApartmentUpsertInput & { apartmentId: string },
  actorUserId?: string,
): Promise<BuilderMutationResult<{ apartmentId: string }>> {
  try {
    return await prisma.$transaction(async (tx) => {
      const floor = await tx.floor.findFirst({
        where: { id: input.floorId, building: { project: { companyId } } },
        select: { id: true },
      });
      if (!floor) {
        return { ok: false, errorKey: 'notFound' };
      }

      const existing = await tx.apartment.findFirst({
        where: {
          id: input.apartmentId,
          floor: { building: { project: { companyId } } },
        },
        select: { id: true, status: true },
      });
      if (!existing) {
        return { ok: false, errorKey: 'notFound' };
      }

      const result = await tx.apartment.updateMany({
        where: {
          id: input.apartmentId,
          floor: { building: { project: { companyId } } },
        },
        data: {
          floorId: floor.id,
          code: input.code,
          rooms: input.rooms,
          areaSqm: input.areaSqm,
          priceAmd: input.priceAmd,
          priceVisibility: input.priceVisibility,
          matterportUrl: input.matterportUrl ?? null,
          status: input.status,
        },
      });

      if (result.count === 0) {
        return { ok: false, errorKey: 'notFound' };
      }

      if (actorUserId) {
        await recordApartmentStatusHistory(tx, {
          apartmentId: existing.id,
          source: 'MANUAL_INVENTORY',
          oldStatus: existing.status,
          newStatus: input.status,
          changedByUserId: actorUserId,
        });
      }

      return { ok: true, apartmentId: input.apartmentId };
    });
  } catch (error) {
    return mapApartmentUniqueError(error);
  }
}

export async function upsertApartment(
  companyId: string,
  input: ApartmentUpsertInput,
  actorUserId?: string,
): Promise<BuilderMutationResult<{ apartmentId: string }>> {
  if (input.apartmentId) {
    return updateApartment(companyId, { ...input, apartmentId: input.apartmentId }, actorUserId);
  }
  return createApartment(companyId, input);
}

function mapApartmentUniqueError(error: unknown): BuilderMutationResult<{ apartmentId: string }> {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === UNIQUE_CONSTRAINT_ERROR
  ) {
    return { ok: false, errorKey: 'codeTaken' };
  }
  throw error;
}
