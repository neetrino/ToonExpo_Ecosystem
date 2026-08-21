import type { Prisma } from '@toonexpo/db';

/**
 * Building list filter for admin/portal inventory hubs.
 */
export const buildInventoryBuildingsWhere = (
  companyId: string | undefined,
  projectId: string | undefined,
  search: string | undefined,
): Prisma.BuildingWhereInput => {
  const scope: Prisma.BuildingWhereInput = {
    ...(projectId ? { projectId } : {}),
    ...(companyId && !projectId ? { project: { builderCompanyId: companyId } } : {}),
  };
  const needle = search?.trim();
  if (!needle) {
    return scope;
  }
  return {
    AND: [
      scope,
      {
        OR: [
          { name: { contains: needle, mode: 'insensitive' } },
          { project: { name: { contains: needle, mode: 'insensitive' } } },
          { project: { builderCompany: { name: { contains: needle, mode: 'insensitive' } } } },
        ],
      },
    ],
  };
};

/**
 * Floor list filter for admin/portal inventory hubs.
 */
export const buildInventoryFloorsWhere = (
  companyId: string | undefined,
  buildingId: string | undefined,
  search: string | undefined,
): Prisma.FloorWhereInput => {
  const scope: Prisma.FloorWhereInput = {
    ...(companyId ? { building: { project: { builderCompanyId: companyId } } } : {}),
    ...(buildingId ? { buildingId } : {}),
  };
  const needle = search?.trim();
  if (!needle) {
    return scope;
  }
  const floorNumber = Number(needle);
  const numberFilter =
    Number.isInteger(floorNumber) && String(floorNumber) === needle
      ? [{ number: floorNumber }]
      : [];
  return {
    AND: [
      scope,
      {
        OR: [
          ...numberFilter,
          { name: { contains: needle, mode: 'insensitive' } },
          { displayLabel: { contains: needle, mode: 'insensitive' } },
          { building: { name: { contains: needle, mode: 'insensitive' } } },
          { building: { project: { name: { contains: needle, mode: 'insensitive' } } } },
          {
            building: {
              project: { builderCompany: { name: { contains: needle, mode: 'insensitive' } } },
            },
          },
        ],
      },
    ],
  };
};

/**
 * Apartment list filter for admin/portal inventory hubs.
 */
export const buildInventoryApartmentsWhere = (
  companyId: string | undefined,
  buildingId: string | undefined,
  search: string | undefined,
): Prisma.ApartmentWhereInput => {
  const scope: Prisma.ApartmentWhereInput = {
    ...(companyId ? { project: { builderCompanyId: companyId } } : {}),
    ...(buildingId ? { buildingId } : {}),
  };
  const needle = search?.trim();
  if (!needle) {
    return scope;
  }
  return {
    AND: [
      scope,
      {
        OR: [
          { number: { contains: needle, mode: 'insensitive' } },
          { building: { name: { contains: needle, mode: 'insensitive' } } },
          { project: { name: { contains: needle, mode: 'insensitive' } } },
          { project: { builderCompany: { name: { contains: needle, mode: 'insensitive' } } } },
        ],
      },
    ],
  };
};
