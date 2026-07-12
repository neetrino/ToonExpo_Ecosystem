import type {
  ApartmentUpsertInput,
  BuildingCreateInput,
  BuildingUpdateInput,
  FloorCreateInput,
  FloorUpdateInput,
} from '@toonexpo/contracts';
import { prisma, Prisma } from '@toonexpo/db';

import { type BuilderMutationResult, UNIQUE_CONSTRAINT_ERROR } from './mutation-result';

export async function createBuilding(
  companyId: string,
  input: BuildingCreateInput,
): Promise<BuilderMutationResult<{ buildingId: string }>> {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.findFirst({
      where: { id: input.projectId, companyId },
      select: { id: true },
    });
    if (!project) {
      return { ok: false, errorKey: 'notFound' };
    }

    const building = await tx.building.create({
      data: { projectId: project.id, name: input.name },
      select: { id: true },
    });

    return { ok: true, buildingId: building.id };
  });
}

export async function updateBuilding(
  companyId: string,
  input: BuildingUpdateInput,
): Promise<BuilderMutationResult<{ buildingId: string }>> {
  const result = await prisma.building.updateMany({
    where: { id: input.buildingId, project: { companyId } },
    data: { name: input.name },
  });

  if (result.count === 0) {
    return { ok: false, errorKey: 'notFound' };
  }

  return { ok: true, buildingId: input.buildingId };
}

export async function createFloor(
  companyId: string,
  input: FloorCreateInput,
): Promise<BuilderMutationResult<{ floorId: string }>> {
  try {
    return await prisma.$transaction(async (tx) => {
      const building = await tx.building.findFirst({
        where: { id: input.buildingId, project: { companyId } },
        select: { id: true },
      });
      if (!building) {
        return { ok: false, errorKey: 'notFound' };
      }

      const floor = await tx.floor.create({
        data: {
          buildingId: building.id,
          name: input.name,
          level: input.level,
        },
        select: { id: true },
      });
      return { ok: true, floorId: floor.id };
    });
  } catch (error) {
    return mapFloorUniqueError(error);
  }
}

export async function updateFloor(
  companyId: string,
  input: FloorUpdateInput,
): Promise<BuilderMutationResult<{ floorId: string }>> {
  try {
    const result = await prisma.floor.updateMany({
      where: { id: input.floorId, building: { project: { companyId } } },
      data: { name: input.name, level: input.level },
    });

    if (result.count === 0) {
      return { ok: false, errorKey: 'notFound' };
    }

    return { ok: true, floorId: input.floorId };
  } catch (error) {
    return mapFloorUniqueError(error);
  }
}

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

      return { ok: true, apartmentId: input.apartmentId };
    });
  } catch (error) {
    return mapApartmentUniqueError(error);
  }
}

export async function upsertApartment(
  companyId: string,
  input: ApartmentUpsertInput,
): Promise<BuilderMutationResult<{ apartmentId: string }>> {
  if (input.apartmentId) {
    return updateApartment(companyId, { ...input, apartmentId: input.apartmentId });
  }
  return createApartment(companyId, input);
}

function mapFloorUniqueError(error: unknown): BuilderMutationResult<{ floorId: string }> {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === UNIQUE_CONSTRAINT_ERROR
  ) {
    return { ok: false, errorKey: 'levelTaken' };
  }
  throw error;
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
