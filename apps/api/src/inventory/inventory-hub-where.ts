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
      ? companyIds.length === 1
        ? { project: { builderCompanyId: companyIds[0] } }
        : { project: { builderCompanyId: { in: companyIds } } }
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
    ...(companyIds.length === 1
      ? { building: { project: { builderCompanyId: companyIds[0] } } }
      : companyIds.length > 1
        ? { building: { project: { builderCompanyId: { in: companyIds } } } }
        : {}),
    ...(buildingIds.length === 1
      ? { buildingId: buildingIds[0] }
      : buildingIds.length > 1
        ? { buildingId: { in: buildingIds } }
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
    ...(companyIds.length === 1
      ? { project: { builderCompanyId: companyIds[0] } }
      : companyIds.length > 1
        ? { project: { builderCompanyId: { in: companyIds } } }
        : {}),
    ...(buildingIds.length === 1
      ? { buildingId: buildingIds[0] }
      : buildingIds.length > 1
        ? { buildingId: { in: buildingIds } }
        : {}),
    ...(floorIds.length === 1
      ? { floorId: floorIds[0] }
      : floorIds.length > 1
        ? { floorId: { in: floorIds } }
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
