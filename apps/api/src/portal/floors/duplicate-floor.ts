import { VisualMapContextType, type Prisma, type PrismaClient } from '@toonexpo/db';

import { TRANSLATION_ENTITY } from '../../catalog/utils/resolve-translation.js';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { syncFloorPlanMediaToCanvas } from '../../visual-map/utils/sync-floor-plan-media.js';
import { entityNotFound } from '../utils/access.js';
import { copyApartmentTranslations, copiedFloorPublishes, copyFloorApartments } from './duplicate-floor-apartment.js';
import { copyFloorCanvases } from './duplicate-floor-canvas.js';
import {
  duplicateCanvasInclude,
  duplicateFloorInclude,
  type DuplicateFloorInput,
  type DuplicateFloorResult,
  type DuplicateFloorSource,
} from './duplicate-floor.types.js';
import { rethrowFloorNumberConflict } from './floor-number-conflict.js';

const copiedText = (override: string | undefined, source: string | null): string | null => {
  if (override === undefined) {
    return source;
  }
  const trimmed = override.trim();
  return trimmed.length > 0 ? trimmed : source;
};

const loadDuplicateBundle = async (db: PrismaClient, input: DuplicateFloorInput) => {
  const floor = await db.floor.findFirst({
    where: {
      id: input.floorId,
      building: { project: { builderCompanyId: input.companyId } },
    },
    include: duplicateFloorInclude,
  });
  if (!floor) {
    return null;
  }
  const apartmentIds = floor.apartments.map((apartment) => apartment.id);
  const [translations, canvases] = await Promise.all([
    apartmentIds.length === 0
      ? Promise.resolve([])
      : db.translation.findMany({
          where: {
            entityType: TRANSLATION_ENTITY.apartment,
            entityId: { in: apartmentIds },
          },
          select: {
            entityId: true,
            entityType: true,
            fieldName: true,
            locale: true,
            value: true,
          },
        }),
    db.visualMapCanvas.findMany({
      where: {
        projectId: floor.building.projectId,
        contextType: VisualMapContextType.floor,
        contextId: floor.id,
      },
      include: duplicateCanvasInclude,
    }),
  ]);
  return { floor, translations, canvases };
};

const createCopiedFloor = async (
  tx: Prisma.TransactionClient,
  source: DuplicateFloorSource,
  input: DuplicateFloorInput,
) =>
  tx.floor.create({
    data: {
      buildingId: source.buildingId,
      number: input.floorNumber,
      publicationStatus: source.publicationStatus,
      name: copiedText(input.name, source.name),
      displayLabel: copiedText(input.displayLabel, source.displayLabel),
      displayOrder: source.displayOrder,
      description: source.description,
      floorplanMediaId: source.floorplanMediaId,
      createdByUserId: input.userId,
      updatedByUserId: input.userId,
    },
    select: { id: true },
  });

const writeDuplicateFloor = async (
  tx: Prisma.TransactionClient,
  bundle: NonNullable<Awaited<ReturnType<typeof loadDuplicateBundle>>>,
  input: DuplicateFloorInput,
): Promise<string> => {
  const floor = await createCopiedFloor(tx, bundle.floor, input);
  const apartmentIds = await copyFloorApartments(tx, bundle.floor, floor.id, input.userId);
  await copyApartmentTranslations(tx, bundle.translations, apartmentIds, input.userId);
  await copyFloorCanvases(
    tx,
    bundle.canvases,
    bundle.floor.id,
    floor.id,
    apartmentIds,
    input.userId,
  );
  return floor.id;
};

const syncMissingFloorCanvas = async (
  db: PrismaClient,
  bundle: NonNullable<Awaited<ReturnType<typeof loadDuplicateBundle>>>,
  floorId: string,
  input: DuplicateFloorInput,
): Promise<void> => {
  if (bundle.canvases.length > 0 || bundle.floor.floorplanMediaId == null) {
    return;
  }
  await syncFloorPlanMediaToCanvas({ db } as PrismaService, {
    companyId: input.companyId,
    userId: input.userId,
    projectId: bundle.floor.building.projectId,
    floorId,
    mediaAssetId: bundle.floor.floorplanMediaId,
    title: copiedText(input.name, bundle.floor.name) ?? `Floor ${input.floorNumber}`,
  });
};

/**
 * Clones a floor onto a new number: plan, apartments, translations, and plan hotspots.
 * Sales status is reset to available. CRM links and homepage pins are not copied.
 */
export const duplicateOwnedFloor = async (
  db: PrismaClient,
  input: DuplicateFloorInput,
): Promise<DuplicateFloorResult> => {
  const bundle = await loadDuplicateBundle(db, input);
  if (!bundle) {
    throw entityNotFound('Floor');
  }
  try {
    const floorId = await db.$transaction((tx) => writeDuplicateFloor(tx, bundle, input));
    await syncMissingFloorCanvas(db, bundle, floorId, input);
    const floor = await db.floor.findUniqueOrThrow({
      where: { id: floorId },
      include: { _count: { select: { apartments: true } } },
    });
    return {
      floor,
      projectId: bundle.floor.building.projectId,
      revalidate: copiedFloorPublishes(bundle.floor, floor.publicationStatus),
    };
  } catch (error) {
    rethrowFloorNumberConflict(error);
    throw error;
  }
};
