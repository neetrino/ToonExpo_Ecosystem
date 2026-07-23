/**
 * Idempotent public visual map canvases for seed projects (dev only).
 * Recreated after cleanup which deletes company visual maps.
 */
import {
  MediaAssetType,
  PublicationStatus,
  VisualHotspotTargetType,
  VisualMapContextType,
  type PrismaClient,
} from '../src/index.js';
import { SEED_PLATFORM_ADMIN_ID } from './seed-auth.js';
import { DEMO_VISUAL_MAP_URL, SEED_ID_PREFIX, toSeedMediaUrl } from './seed-data.js';
import { ALL_SEED_PROJECTS as SEED_PROJECTS } from './seed-entities.js';

/**
 * Upserts one published primary project canvas per seed project with building hotspots.
 */
export const upsertSeedVisualMaps = async (prisma: PrismaClient): Promise<number> => {
  let canvasCount = 0;

  for (const [projectIndex, project] of SEED_PROJECTS.entries()) {
    const mediaId = `${SEED_ID_PREFIX}media_visual_${project.id}`;
    const canvasId = `${SEED_ID_PREFIX}visual_canvas_${project.id}`;

    await prisma.mediaAsset.upsert({
      where: { id: mediaId },
      create: {
        id: mediaId,
        ownerCompanyId: project.builderId,
        type: MediaAssetType.image,
        fileUrl: toSeedMediaUrl(DEMO_VISUAL_MAP_URL),
        title: `${project.name} visual map`,
        altText: `${project.name} site plan`,
        relatedEntityType: 'project',
        relatedEntityId: project.id,
      },
      update: {
        fileUrl: toSeedMediaUrl(DEMO_VISUAL_MAP_URL),
        title: `${project.name} visual map`,
        altText: `${project.name} site plan`,
      },
    });

    await prisma.visualMapCanvas.upsert({
      where: { id: canvasId },
      create: {
        id: canvasId,
        ownerCompanyId: project.builderId,
        projectId: project.id,
        contextType: VisualMapContextType.project,
        contextId: project.id,
        mediaAssetId: mediaId,
        title: `${project.name} site plan`,
        description: 'Seed visual map for public project navigation',
        publicationStatus: PublicationStatus.published,
        isPrimary: true,
        sortOrder: projectIndex,
        createdByUserId: SEED_PLATFORM_ADMIN_ID,
        updatedByUserId: SEED_PLATFORM_ADMIN_ID,
      },
      update: {
        ownerCompanyId: project.builderId,
        projectId: project.id,
        contextType: VisualMapContextType.project,
        contextId: project.id,
        mediaAssetId: mediaId,
        title: `${project.name} site plan`,
        description: 'Seed visual map for public project navigation',
        publicationStatus: PublicationStatus.published,
        isPrimary: true,
        sortOrder: projectIndex,
        updatedByUserId: SEED_PLATFORM_ADMIN_ID,
      },
    });

    for (const [buildingIndex, building] of project.buildings.entries()) {
      const hotspotId = `${SEED_ID_PREFIX}hotspot_${building.id}`;
      const xPercent = 25 + buildingIndex * 28;
      const yPercent = 40 + (projectIndex % 2) * 15;

      await prisma.visualHotspot.upsert({
        where: { id: hotspotId },
        create: {
          id: hotspotId,
          canvasId,
          label: building.name,
          targetType: VisualHotspotTargetType.building,
          targetId: building.id,
          xPercent,
          yPercent,
          sortOrder: buildingIndex,
          publicationStatus: PublicationStatus.published,
          createdByUserId: SEED_PLATFORM_ADMIN_ID,
          updatedByUserId: SEED_PLATFORM_ADMIN_ID,
        },
        update: {
          canvasId,
          label: building.name,
          targetType: VisualHotspotTargetType.building,
          targetId: building.id,
          xPercent,
          yPercent,
          sortOrder: buildingIndex,
          publicationStatus: PublicationStatus.published,
          updatedByUserId: SEED_PLATFORM_ADMIN_ID,
        },
      });
    }

    canvasCount += 1;
  }

  return canvasCount;
};
