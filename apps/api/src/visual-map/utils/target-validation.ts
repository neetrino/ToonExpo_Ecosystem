import type { VisualHotspotTargetType, VisualMapContextType } from "@toonexpo/contracts";
import { PublicationStatus } from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { entityNotFound } from "../../portal/utils/access.js";
import { assertTargetTypeMatchesContext, toDbTargetType } from "./target-type.js";

type TargetValidationInput = {
  contextType: VisualMapContextType;
  contextId: string;
  projectId: string;
  companyId: string;
  targetType: VisualHotspotTargetType;
  targetId: string;
};

type TargetEntity = {
  publicationStatus: PublicationStatus;
};

/**
 * Validates hotspot target exists in the correct hierarchy for the canvas context.
 */
export const validateHotspotTarget = async (
  prisma: PrismaService,
  input: TargetValidationInput,
): Promise<TargetEntity> => {
  assertTargetTypeMatchesContext(input.contextType, input.targetType);

  if (input.targetType === "building") {
    const building = await prisma.db.building.findFirst({
      where: {
        id: input.targetId,
        projectId: input.projectId,
        project: { builderCompanyId: input.companyId },
      },
      select: { publicationStatus: true },
    });
    if (!building) {
      throw entityNotFound("Building");
    }
    return building;
  }

  if (input.targetType === "floor") {
    const floor = await prisma.db.floor.findFirst({
      where: {
        id: input.targetId,
        buildingId: input.contextId,
        building: {
          projectId: input.projectId,
          project: { builderCompanyId: input.companyId },
        },
      },
      select: { publicationStatus: true },
    });
    if (!floor) {
      throw entityNotFound("Floor");
    }
    return floor;
  }

  const apartment = await prisma.db.apartment.findFirst({
    where: {
      id: input.targetId,
      floorId: input.contextId,
      projectId: input.projectId,
      project: { builderCompanyId: input.companyId },
    },
    select: { publicationStatus: true },
  });
  if (!apartment) {
    throw entityNotFound("Apartment");
  }
  return apartment;
};

export type LoadedTargetEntities = {
  buildings: Map<string, { name: string; publicationStatus: PublicationStatus }>;
  floors: Map<
    string,
    {
      displayLabel: string | null;
      name: string | null;
      number: number;
      publicationStatus: PublicationStatus;
    }
  >;
  apartments: Map<string, { number: string; publicationStatus: PublicationStatus }>;
};

/**
 * Batch-loads hotspot target entities for editor targetStatus resolution.
 */
export const loadTargetEntities = async (
  prisma: PrismaService,
  hotspots: Array<{ targetType: VisualHotspotTargetType; targetId: string }>,
): Promise<LoadedTargetEntities> => {
  const buildingIds = hotspots
    .filter((hotspot) => hotspot.targetType === "building")
    .map((hotspot) => hotspot.targetId);
  const floorIds = hotspots
    .filter((hotspot) => hotspot.targetType === "floor")
    .map((hotspot) => hotspot.targetId);
  const apartmentIds = hotspots
    .filter((hotspot) => hotspot.targetType === "apartment")
    .map((hotspot) => hotspot.targetId);

  const [buildings, floors, apartments] = await Promise.all([
    buildingIds.length
      ? prisma.db.building.findMany({
          where: { id: { in: buildingIds } },
          select: { id: true, name: true, publicationStatus: true },
        })
      : [],
    floorIds.length
      ? prisma.db.floor.findMany({
          where: { id: { in: floorIds } },
          select: {
            id: true,
            displayLabel: true,
            name: true,
            number: true,
            publicationStatus: true,
          },
        })
      : [],
    apartmentIds.length
      ? prisma.db.apartment.findMany({
          where: { id: { in: apartmentIds } },
          select: { id: true, number: true, publicationStatus: true },
        })
      : [],
  ]);

  return {
    buildings: new Map(buildings.map((row) => [row.id, row])),
    floors: new Map(floors.map((row) => [row.id, row])),
    apartments: new Map(apartments.map((row) => [row.id, row])),
  };
};

export const lookupTargetEntity = (
  entities: LoadedTargetEntities,
  targetType: VisualHotspotTargetType,
  targetId: string,
): TargetEntity | undefined => {
  if (targetType === "building") {
    return entities.buildings.get(targetId);
  }
  if (targetType === "floor") {
    return entities.floors.get(targetId);
  }
  return entities.apartments.get(targetId);
};

export const loadPublicTargetEntities = loadTargetEntities;

export { toDbTargetType };
