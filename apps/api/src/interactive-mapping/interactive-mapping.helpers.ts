import type { InteractiveMappingProjectSummary } from '@toonexpo/contracts';
import type { Prisma } from '@toonexpo/db';

import type { PrismaService } from '../prisma/prisma.service.js';
import { buildPhaseInput, computePhaseProgress, type CanvasSnapshot } from './phase-progress.js';

export type ProjectListRow = Prisma.ProjectGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    builderCompanyId: true;
    publicationStatus: true;
    districts: { select: { id: true } };
    buildings: { select: { id: true; floorsCount: true } };
    _count: { select: { apartments: true } };
  };
}>;

/**
 * Simple slugify: lowercase, non-alnum → `-`, trim edges.
 */
export const slugifyDistrictName = (name: string): string => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
  return slug.length > 0 ? slug : 'district';
};

export const toProjectSummary = (
  project: ProjectListRow,
  floorIds: string[],
  canvases: CanvasSnapshot[],
): InteractiveMappingProjectSummary => {
  const { phases, activePhase } = computePhaseProgress(
    buildPhaseInput({
      districtIds: project.districts.map((d) => d.id),
      buildings: project.buildings,
      floorIds,
      canvases,
    }),
  );
  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    builderCompanyId: project.builderCompanyId,
    publicationStatus: project.publicationStatus,
    activePhase,
    phases,
    districtCount: project.districts.length,
    buildingCount: project.buildings.length,
    floorCount: floorIds.length,
    apartmentCount: project._count.apartments,
  };
};

export const loadFloorsByProject = async (
  prisma: PrismaService,
  projectIds: string[],
): Promise<Map<string, string[]>> => {
  const result = new Map<string, string[]>();
  if (projectIds.length === 0) {
    return result;
  }
  const floors = await prisma.db.floor.findMany({
    where: { building: { projectId: { in: projectIds } } },
    select: { id: true, building: { select: { projectId: true } } },
  });
  for (const floor of floors) {
    const list = result.get(floor.building.projectId) ?? [];
    list.push(floor.id);
    result.set(floor.building.projectId, list);
  }
  return result;
};

export const loadCanvasSnapshots = async (
  prisma: PrismaService,
  projectIds: string[],
): Promise<Map<string, CanvasSnapshot[]>> => {
  const result = new Map<string, CanvasSnapshot[]>();
  if (projectIds.length === 0) {
    return result;
  }
  const canvases = await prisma.db.visualMapCanvas.findMany({
    where: { projectId: { in: projectIds } },
    select: {
      projectId: true,
      contextType: true,
      contextId: true,
      mediaAssetId: true,
      hotspots: { select: { targetType: true } },
    },
  });
  for (const canvas of canvases) {
    const list = result.get(canvas.projectId) ?? [];
    list.push({
      contextType: canvas.contextType,
      contextId: canvas.contextId,
      hasMedia: Boolean(canvas.mediaAssetId),
      hotspotTargetTypes: canvas.hotspots.map((h) => h.targetType),
    });
    result.set(canvas.projectId, list);
  }
  return result;
};
