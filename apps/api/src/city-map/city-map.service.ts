import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  type CityMapBuildingOptionsResponse,
  type CityMapPlacementItem,
  type CityMapPlacementListResponse,
  type CreateCityMapPlacementRequest,
  type PublicCityMapConfig,
  type PublicCityMapPlacementsResponse,
  type UpdateCityMapPlacementRequest,
} from '@toonexpo/contracts';
import { MediaAssetType, PublicationStatus, type Prisma } from '@toonexpo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { resolvePublicCityMapConfig } from './city-map-public-config.js';
import {
  CITY_MAP_DEFAULT_MIN_ZOOM,
  CITY_MAP_DEFAULT_ROTATION_X,
  CITY_MAP_MAX_PLACEMENTS,
} from './city-map.constants.js';
import {
  PUBLIC_VISIBILITY,
  toCityMapPlacementItem,
  toPublicCityMapPlacement,
} from './city-map.mappers.js';

const placementInclude = {
  building: { select: { name: true, displayOrder: true } },
  project: { select: { name: true, address: true, city: true } },
  glbMediaAsset: { select: { fileUrl: true } },
} as const;

@Injectable()
export class CityMapService {
  constructor(private readonly prisma: PrismaService) {}

  async listAdmin(input: {
    status?: PublicationStatus;
    projectId?: string;
    q?: string;
  }): Promise<CityMapPlacementListResponse> {
    const where: Prisma.CityMapPlacementWhereInput = {};
    if (input.status) {
      where.publicationStatus = input.status;
    }
    if (input.projectId) {
      where.projectId = input.projectId;
    }
    const q = input.q?.trim();
    if (q) {
      where.OR = [
        { building: { name: { contains: q, mode: 'insensitive' } } },
        { project: { name: { contains: q, mode: 'insensitive' } } },
        { project: { address: { contains: q, mode: 'insensitive' } } },
        { project: { city: { contains: q, mode: 'insensitive' } } },
        { labelOverride: { contains: q, mode: 'insensitive' } },
      ];
    }

    const rows = await this.prisma.db.cityMapPlacement.findMany({
      where,
      include: placementInclude,
      orderBy: [{ projectId: 'asc' }, { createdAt: 'desc' }],
    });

    return { data: rows.map(toCityMapPlacementItem) };
  }

  async getById(id: string): Promise<CityMapPlacementItem> {
    const row = await this.prisma.db.cityMapPlacement.findUnique({
      where: { id },
      include: placementInclude,
    });
    if (!row) {
      throw new NotFoundException('City map placement not found');
    }
    return toCityMapPlacementItem(row);
  }

  async create(userId: string, body: CreateCityMapPlacementRequest): Promise<CityMapPlacementItem> {
    const count = await this.prisma.db.cityMapPlacement.count();
    if (count >= CITY_MAP_MAX_PLACEMENTS) {
      throw new BadRequestException(
        `Maximum of ${CITY_MAP_MAX_PLACEMENTS} city map placements reached`,
      );
    }

    const building = await this.prisma.db.building.findUnique({
      where: { id: body.buildingId },
      select: {
        id: true,
        projectId: true,
        cityMapPlacement: { select: { id: true } },
      },
    });
    if (!building) {
      throw new NotFoundException('Building not found');
    }
    if (building.cityMapPlacement) {
      throw new ConflictException('Building already has a city map placement');
    }

    await this.assertGlbMedia(body.glbMediaAssetId);

    const row = await this.prisma.db.cityMapPlacement.create({
      data: {
        buildingId: body.buildingId,
        projectId: building.projectId,
        glbMediaAssetId: body.glbMediaAssetId,
        longitude: body.longitude,
        latitude: body.latitude,
        altitude: body.altitude ?? 0,
        rotationX: body.rotationX ?? CITY_MAP_DEFAULT_ROTATION_X,
        rotationY: body.rotationY ?? 0,
        rotationZ: body.rotationZ ?? 0,
        scale: body.scale ?? 1,
        minZoom: body.minZoom ?? CITY_MAP_DEFAULT_MIN_ZOOM,
        labelOverride: body.labelOverride ?? null,
        publicationStatus: body.publicationStatus ?? PublicationStatus.draft,
        createdByUserId: userId,
        updatedByUserId: userId,
      },
      include: placementInclude,
    });

    return toCityMapPlacementItem(row);
  }

  async update(
    userId: string,
    id: string,
    body: UpdateCityMapPlacementRequest,
  ): Promise<CityMapPlacementItem> {
    await this.getById(id);
    if (body.glbMediaAssetId) {
      await this.assertGlbMedia(body.glbMediaAssetId);
    }

    const row = await this.prisma.db.cityMapPlacement.update({
      where: { id },
      data: {
        ...(body.glbMediaAssetId !== undefined ? { glbMediaAssetId: body.glbMediaAssetId } : {}),
        ...(body.longitude !== undefined ? { longitude: body.longitude } : {}),
        ...(body.latitude !== undefined ? { latitude: body.latitude } : {}),
        ...(body.altitude !== undefined ? { altitude: body.altitude } : {}),
        ...(body.rotationX !== undefined ? { rotationX: body.rotationX } : {}),
        ...(body.rotationY !== undefined ? { rotationY: body.rotationY } : {}),
        ...(body.rotationZ !== undefined ? { rotationZ: body.rotationZ } : {}),
        ...(body.scale !== undefined ? { scale: body.scale } : {}),
        ...(body.minZoom !== undefined ? { minZoom: body.minZoom } : {}),
        ...(body.labelOverride !== undefined ? { labelOverride: body.labelOverride } : {}),
        ...(body.publicationStatus !== undefined
          ? { publicationStatus: body.publicationStatus }
          : {}),
        updatedByUserId: userId,
      },
      include: placementInclude,
    });

    return toCityMapPlacementItem(row);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.prisma.db.cityMapPlacement.delete({ where: { id } });
  }

  async setPublicationStatus(
    userId: string,
    id: string,
    publicationStatus: PublicationStatus,
  ): Promise<CityMapPlacementItem> {
    return this.update(userId, id, { publicationStatus });
  }

  async buildingOptions(q?: string): Promise<CityMapBuildingOptionsResponse> {
    const query = q?.trim();
    const where: Prisma.BuildingWhereInput = query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { project: { name: { contains: query, mode: 'insensitive' } } },
            { project: { address: { contains: query, mode: 'insensitive' } } },
            { project: { city: { contains: query, mode: 'insensitive' } } },
          ],
        }
      : {};

    const buildings = await this.prisma.db.building.findMany({
      where,
      take: 40,
      orderBy: [{ project: { name: 'asc' } }, { displayOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        projectId: true,
        cityMapPlacement: { select: { id: true } },
        project: {
          select: {
            name: true,
            address: true,
            city: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    return {
      data: buildings.map((building) => ({
        buildingId: building.id,
        buildingName: building.name,
        projectId: building.projectId,
        projectName: building.project.name,
        address: building.project.address,
        city: building.project.city,
        latitude: building.project.latitude ? Number(building.project.latitude) : null,
        longitude: building.project.longitude ? Number(building.project.longitude) : null,
        hasPlacement: Boolean(building.cityMapPlacement),
      })),
    };
  }

  async listPublic(): Promise<PublicCityMapPlacementsResponse> {
    const rows = await this.prisma.db.cityMapPlacement.findMany({
      where: {
        publicationStatus: PUBLIC_VISIBILITY,
        building: { publicationStatus: PUBLIC_VISIBILITY },
        project: { publicationStatus: PUBLIC_VISIBILITY },
      },
      include: placementInclude,
      orderBy: [{ building: { displayOrder: 'asc' } }, { createdAt: 'asc' }],
    });

    return { data: rows.map(toPublicCityMapPlacement) };
  }

  getPublicConfig(): PublicCityMapConfig {
    return resolvePublicCityMapConfig();
  }

  private async assertGlbMedia(mediaAssetId: string): Promise<void> {
    const media = await this.prisma.db.mediaAsset.findUnique({
      where: { id: mediaAssetId },
      select: { id: true, type: true },
    });
    if (!media) {
      throw new NotFoundException('GLB media asset not found');
    }
    if (media.type !== MediaAssetType.model3d) {
      throw new BadRequestException('Media asset must be type model3d');
    }
  }
}
