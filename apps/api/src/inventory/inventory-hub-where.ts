import type { Prisma } from '@toonexpo/db';

const toIdList = (value: string | readonly string[] | undefined): string[] => {
  if (value == null) {
    return [];
  }
  const list = Array.isArray(value) ? value : [value];
  return list.map((id) => id.trim()).filter((id) => id.length > 0);
};

/**
 * Building list filter for admin/portal inventory hubs.
 */
export const buildInventoryBuildingsWhere = (
  companyId: string | readonly string[] | undefined,
  projectId: string | undefined,
  search: string | undefined,
): Prisma.BuildingWhereInput => {
  const companyIds = toIdList(companyId);
  const scope: Prisma.BuildingWhereInput = {
    ...(projectId ? { projectId } : {}),
    ...(companyIds.length > 0 && !projectId
      ? {
          project: {
            builderCompanyId: companyIds.length === 1 ? companyIds[0]! : { in: companyIds },
          },
        }
      : {}),
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
  companyId: string | readonly string[] | undefined,
  buildingId: string | readonly string[] | undefined,
  search: string | undefined,
): Prisma.FloorWhereInput => {
  const companyIds = toIdList(companyId);
  const buildingIds = toIdList(buildingId);
  const scope: Prisma.FloorWhereInput = {
    ...(companyIds.length > 0
      ? {
          building: {
            project: {
              builderCompanyId: companyIds.length === 1 ? companyIds[0]! : { in: companyIds },
            },
          },
        }
      : {}),
    ...(buildingIds.length > 0
      ? { buildingId: buildingIds.length === 1 ? buildingIds[0]! : { in: buildingIds } }
      : {}),
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
  companyId: string | readonly string[] | undefined,
  buildingId: string | readonly string[] | undefined,
  floorId: string | readonly string[] | undefined,
  search: string | undefined,
): Prisma.ApartmentWhereInput => {
  const companyIds = toIdList(companyId);
  const buildingIds = toIdList(buildingId);
  const floorIds = toIdList(floorId);
  const scope: Prisma.ApartmentWhereInput = {
    ...(companyIds.length > 0
      ? {
          project: {
            builderCompanyId: companyIds.length === 1 ? companyIds[0]! : { in: companyIds },
          },
        }
      : {}),
    ...(buildingIds.length > 0
      ? { buildingId: buildingIds.length === 1 ? buildingIds[0]! : { in: buildingIds } }
      : {}),
    ...(floorIds.length > 0
      ? { floorId: floorIds.length === 1 ? floorIds[0]! : { in: floorIds } }
      : {}),
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
