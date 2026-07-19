import type { Prisma } from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { entityNotFound } from "./access.js";

type ProjectOwned = {
  id: string;
  builderCompanyId: string;
};

type BuildingOwned = {
  id: string;
  projectId: string;
  project: { builderCompanyId: string };
};

type FloorOwned = {
  id: string;
  buildingId: string;
  building: { projectId: string; project: { builderCompanyId: string } };
};

type ApartmentOwned = {
  id: string;
  projectId: string;
  buildingId: string;
  floorId: string;
  project: { builderCompanyId: string };
};

/**
 * Loads a project owned by companyId or throws 404.
 */
export const requireOwnedProject = async (
  prisma: PrismaService,
  projectId: string,
  companyId: string,
): Promise<ProjectOwned> => {
  const project = await prisma.db.project.findFirst({
    where: { id: projectId, builderCompanyId: companyId },
    select: { id: true, builderCompanyId: true },
  });
  if (!project) {
    throw entityNotFound("Project");
  }
  return project;
};

/**
 * Loads a building in the company ownership chain or throws 404.
 */
export const requireOwnedBuilding = async (
  prisma: PrismaService,
  buildingId: string,
  companyId: string,
): Promise<BuildingOwned> => {
  const building = await prisma.db.building.findFirst({
    where: {
      id: buildingId,
      project: { builderCompanyId: companyId },
    },
    select: {
      id: true,
      projectId: true,
      project: { select: { builderCompanyId: true } },
    },
  });
  if (!building) {
    throw entityNotFound("Building");
  }
  return building;
};

/**
 * Loads a floor in the company ownership chain or throws 404.
 */
export const requireOwnedFloor = async (
  prisma: PrismaService,
  floorId: string,
  companyId: string,
): Promise<FloorOwned> => {
  const floor = await prisma.db.floor.findFirst({
    where: {
      id: floorId,
      building: { project: { builderCompanyId: companyId } },
    },
    select: {
      id: true,
      buildingId: true,
      building: {
        select: {
          projectId: true,
          project: { select: { builderCompanyId: true } },
        },
      },
    },
  });
  if (!floor) {
    throw entityNotFound("Floor");
  }
  return floor;
};

/**
 * Loads an apartment in the company ownership chain or throws 404.
 */
export const requireOwnedApartment = async (
  prisma: PrismaService,
  apartmentId: string,
  companyId: string,
  extraSelect?: Prisma.ApartmentSelect,
): Promise<ApartmentOwned & Record<string, unknown>> => {
  const apartment = await prisma.db.apartment.findFirst({
    where: {
      id: apartmentId,
      project: { builderCompanyId: companyId },
    },
    select: {
      id: true,
      projectId: true,
      buildingId: true,
      floorId: true,
      project: { select: { builderCompanyId: true } },
      ...extraSelect,
    },
  });
  if (!apartment) {
    throw entityNotFound("Apartment");
  }
  return apartment as ApartmentOwned & Record<string, unknown>;
};
