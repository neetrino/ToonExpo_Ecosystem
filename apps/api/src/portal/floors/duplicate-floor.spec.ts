import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  ApartmentSalesStatus,
  PriceVisibility,
  Prisma,
  PublicationStatus,
  VisualHotspotTargetType,
  VisualMapContextType,
} from '@toonexpo/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildCopiedApartmentData } from './duplicate-floor-apartment.js';
import { remapCopiedHotspotTarget } from './duplicate-floor-canvas.js';
import { duplicateOwnedFloor } from './duplicate-floor.js';
import type { DuplicateFloorSource } from './duplicate-floor.types.js';
import {
  FLOOR_NUMBER_CONFLICT_MESSAGE,
  rethrowFloorNumberConflict,
} from './floor-number-conflict.js';

const sourceApartment = {
  id: 'apt_1',
  number: '12',
  salesStatus: ApartmentSalesStatus.sold,
  publicationStatus: PublicationStatus.published,
  rooms: 3,
  bedrooms: 2,
  bathrooms: 1,
  areaTotal: null,
  areaLiving: null,
  balconyArea: null,
  price: null,
  priceCurrency: 'AMD',
  priceVisibility: PriceVisibility.public,
  description: 'Corner unit',
  planMediaId: 'plan_1',
  coverMediaId: 'cover_1',
  tinderMediaId: null,
  matterportUrl: null,
  external3dUrl: null,
  orientation: 'south',
  viewType: 'city',
  features: { balcony: true },
  verified: true,
  galleryImages: [{ mediaAssetId: 'media_1', sortOrder: 0 }],
} as DuplicateFloorSource['apartments'][number];

describe('buildCopiedApartmentData', () => {
  it('keeps the unit layout and resets sales to available', () => {
    const data = buildCopiedApartmentData(sourceApartment, {
      userId: 'user_1',
      projectId: 'proj_1',
      buildingId: 'bld_1',
      floorId: 'floor_new',
    });

    expect(data.number).toBe('12');
    expect(data.floorId).toBe('floor_new');
    expect(data.salesStatus).toBe(ApartmentSalesStatus.available);
    expect(data.publicationStatus).toBe(PublicationStatus.published);
    expect(data.rooms).toBe(3);
    expect(data.planMediaId).toBe('plan_1');
    expect(data.featuredOnHome).toBe(false);
    expect(data.verified).toBe(true);
    expect(data.galleryImages).toEqual({
      create: [{ mediaAssetId: 'media_1', sortOrder: 0 }],
    });
    expect(data.statusHistory).toEqual({
      create: {
        previousStatus: null,
        newStatus: ApartmentSalesStatus.available,
        changedByUserId: 'user_1',
        reason: 'initial',
      },
    });
  });
});

describe('remapCopiedHotspotTarget', () => {
  const apartmentIds = new Map([['apt_1', 'apt_new']]);

  it('remaps apartment and source-floor targets', () => {
    expect(
      remapCopiedHotspotTarget(
        { targetType: VisualHotspotTargetType.apartment, targetId: 'apt_1' },
        'floor_src',
        'floor_new',
        apartmentIds,
      ),
    ).toBe('apt_new');
    expect(
      remapCopiedHotspotTarget(
        { targetType: VisualHotspotTargetType.floor, targetId: 'floor_src' },
        'floor_src',
        'floor_new',
        apartmentIds,
      ),
    ).toBe('floor_new');
  });

  it('drops hotspots for apartments that were not copied', () => {
    expect(
      remapCopiedHotspotTarget(
        { targetType: VisualHotspotTargetType.apartment, targetId: 'apt_missing' },
        'floor_src',
        'floor_new',
        apartmentIds,
      ),
    ).toBeNull();
  });

  it('keeps targets that are not part of this floor', () => {
    expect(
      remapCopiedHotspotTarget(
        { targetType: VisualHotspotTargetType.building, targetId: 'bld_1' },
        'floor_src',
        'floor_new',
        apartmentIds,
      ),
    ).toBe('bld_1');
  });
});

describe('duplicateOwnedFloor', () => {
  const floorCreate = vi.fn();
  const apartmentFindUnique = vi.fn();
  const apartmentCreate = vi.fn();
  const translationCreateMany = vi.fn();
  const canvasCreate = vi.fn();
  const hotspotCreateMany = vi.fn();
  const floorFindFirst = vi.fn();
  const translationFindMany = vi.fn();
  const canvasFindMany = vi.fn();
  const floorFindUniqueOrThrow = vi.fn();
  const transaction = vi.fn();

  const tx = {
    floor: { create: floorCreate },
    apartment: { findUnique: apartmentFindUnique, create: apartmentCreate },
    translation: { createMany: translationCreateMany },
    visualMapCanvas: { create: canvasCreate },
    visualHotspot: { createMany: hotspotCreateMany },
  };

  const db = {
    floor: { findFirst: floorFindFirst, findUniqueOrThrow: floorFindUniqueOrThrow },
    translation: { findMany: translationFindMany },
    visualMapCanvas: { findMany: canvasFindMany },
    $transaction: transaction,
  };

  const sourceFloor = {
    id: 'floor_src',
    buildingId: 'bld_1',
    number: 2,
    publicationStatus: PublicationStatus.published,
    name: 'Typical',
    displayLabel: 'Floor 2',
    displayOrder: 2,
    description: 'Same plan',
    floorplanMediaId: 'plan_media',
    building: { id: 'bld_1', projectId: 'proj_1', project: { slug: 'sunrise' } },
    apartments: [sourceApartment],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(async (fn: (client: typeof tx) => Promise<string>) => fn(tx));
    floorFindFirst.mockResolvedValue(sourceFloor);
    translationFindMany.mockResolvedValue([
      {
        entityId: 'apt_1',
        entityType: 'apartment',
        fieldName: 'description',
        locale: 'en',
        value: 'Corner',
      },
    ]);
    canvasFindMany.mockResolvedValue([
      {
        ownerCompanyId: 'co_1',
        projectId: 'proj_1',
        contextType: VisualMapContextType.floor,
        mediaAssetId: 'plan_media',
        title: 'Plan',
        description: null,
        publicationStatus: PublicationStatus.published,
        isPrimary: true,
        sortOrder: 0,
        hotspots: [
          {
            targetType: VisualHotspotTargetType.apartment,
            targetId: 'apt_1',
            label: '12',
            xPercent: 10,
            yPercent: 20,
            shapeType: 'polygon',
            interactionType: 'polygon',
            svgPath: 'M0 0',
            points: null,
            markerStyle: null,
            publicationStatus: PublicationStatus.published,
            sortOrder: 0,
          },
          {
            targetType: VisualHotspotTargetType.floor,
            targetId: 'floor_src',
            label: 'Floor',
            xPercent: 1,
            yPercent: 2,
            shapeType: 'point',
            interactionType: 'marker',
            svgPath: null,
            points: null,
            markerStyle: null,
            publicationStatus: PublicationStatus.draft,
            sortOrder: 1,
          },
        ],
      },
    ]);
    floorCreate.mockResolvedValue({ id: 'floor_new' });
    apartmentFindUnique.mockResolvedValue(null);
    apartmentCreate.mockResolvedValue({ id: 'apt_new' });
    translationCreateMany.mockResolvedValue({ count: 1 });
    canvasCreate.mockResolvedValue({ id: 'canvas_new' });
    hotspotCreateMany.mockResolvedValue({ count: 2 });
    floorFindUniqueOrThrow.mockResolvedValue({
      id: 'floor_new',
      publicationStatus: PublicationStatus.published,
      _count: { apartments: 1 },
    });
  });

  it('copies the floor, apartment, translation, and remapped hotspots', async () => {
    const result = await duplicateOwnedFloor(db as never, {
      companyId: 'co_1',
      userId: 'user_1',
      floorId: 'floor_src',
      floorNumber: 4,
      name: 'Copy',
    });

    expect(floorCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          buildingId: 'bld_1',
          number: 4,
          name: 'Copy',
          displayLabel: 'Floor 2',
          description: 'Same plan',
          floorplanMediaId: 'plan_media',
          publicationStatus: PublicationStatus.published,
        }),
      }),
    );
    expect(apartmentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          floorId: 'floor_new',
          number: '12',
          salesStatus: ApartmentSalesStatus.available,
        }),
      }),
    );
    expect(translationCreateMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          entityId: 'apt_new',
          value: 'Corner',
        }),
      ],
    });
    expect(canvasCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ contextId: 'floor_new', mediaAssetId: 'plan_media' }),
      }),
    );
    expect(hotspotCreateMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({ targetId: 'apt_new', canvasId: 'canvas_new' }),
        expect.objectContaining({ targetId: 'floor_new', canvasId: 'canvas_new' }),
      ],
    });
    expect(result.revalidate).toBe(true);
    expect(result.projectId).toBe('proj_1');
  });

  it('returns not found when the floor is outside the company', async () => {
    floorFindFirst.mockResolvedValue(null);

    await expect(
      duplicateOwnedFloor(db as never, {
        companyId: 'co_1',
        userId: 'user_1',
        floorId: 'missing',
        floorNumber: 3,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('maps a Prisma 7 floor unique error without meta.target', () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (`building_id`, `number`)',
      {
        code: 'P2002',
        clientVersion: '7.8.0',
        meta: { modelName: 'Floor' },
      },
    );

    expect(() => {
      rethrowFloorNumberConflict(error);
    }).toThrow(FLOOR_NUMBER_CONFLICT_MESSAGE);
  });

  it('turns a duplicate floor number into a conflict', async () => {
    transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['buildingId', 'number'] },
      }),
    );

    await expect(
      duplicateOwnedFloor(db as never, {
        companyId: 'co_1',
        userId: 'user_1',
        floorId: 'floor_src',
        floorNumber: 2,
      }),
    ).rejects.toEqual(expect.any(ConflictException));

    await expect(
      duplicateOwnedFloor(db as never, {
        companyId: 'co_1',
        userId: 'user_1',
        floorId: 'floor_src',
        floorNumber: 2,
      }),
    ).rejects.toThrow(FLOOR_NUMBER_CONFLICT_MESSAGE);
  });
});
