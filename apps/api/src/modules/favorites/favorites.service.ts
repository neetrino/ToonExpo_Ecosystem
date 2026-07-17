import { Inject, Injectable, Logger } from '@nestjs/common';
import type {
  FavoriteListItem,
  FavoriteMutationResponse,
  FavoriteToggleInput,
} from '@toonexpo/contracts';
import { Prisma } from '@toonexpo/db';
import type {
  AnalyticsEventType,
  ApartmentStatus,
  FavoriteTargetType,
  PriceVisibility,
} from '@toonexpo/domain';

import { PrismaService } from '../../common/prisma.service';
import { resolveFavoritePrice } from './favorite-price';

type FavoriteRow = {
  id: string;
  targetType: FavoriteTargetType;
  targetId: string;
  createdAt: Date;
};

type ProjectTarget = {
  id: string;
  name: string;
  slug: string;
  company: { name: string; slug: string };
};

type ApartmentTarget = {
  id: string;
  code: string;
  status: ApartmentStatus;
  priceAmd: number | null;
  priceVisibility: PriceVisibility;
  floor: {
    building: {
      project: {
        name: string;
        slug: string;
        company: { name: string; slug: string };
      };
    };
  };
};

type ResolvedTarget = {
  targetType: FavoriteTargetType;
  targetId: string;
  companyId: string;
  projectId: string;
  apartmentId?: string;
};

@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<FavoriteListItem[]> {
    const rows = await this.prisma.client.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, targetType: true, targetId: true, createdAt: true },
    });
    const projects = await this.loadProjects(idsForType(rows, 'PROJECT'));
    const apartments = await this.loadApartments(idsForType(rows, 'APARTMENT'));

    const items: FavoriteListItem[] = [];
    for (const row of rows) {
      const item = this.mapFavorite(row, projects, apartments);
      if (item) {
        items.push(item);
      }
    }
    return items;
  }

  async isFavorited(userId: string, input: FavoriteToggleInput): Promise<boolean> {
    const row = await this.prisma.client.favorite.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: input.targetType,
          targetId: input.targetId,
        },
      },
      select: { id: true },
    });
    return Boolean(row);
  }

  async add(userId: string, input: FavoriteToggleInput): Promise<FavoriteMutationResponse | null> {
    const target = await this.resolvePublishedTarget(input);
    if (!target) {
      return null;
    }

    try {
      await this.prisma.client.favorite.create({
        data: { userId, targetType: target.targetType, targetId: target.targetId },
      });
      this.scheduleAnalytics('FAVORITE_ADDED', target);
    } catch (error) {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }
    }
    return { favorited: true };
  }

  async remove(
    userId: string,
    input: FavoriteToggleInput,
  ): Promise<FavoriteMutationResponse | null> {
    const target = await this.resolvePublishedTarget(input);
    const deleted = await this.prisma.client.favorite.deleteMany({
      where: { userId, targetType: input.targetType, targetId: input.targetId },
    });
    if (!target && deleted.count === 0) {
      return null;
    }
    if (target && deleted.count > 0) {
      this.scheduleAnalytics('FAVORITE_REMOVED', target);
    }
    return { favorited: false };
  }

  async toggle(
    userId: string,
    input: FavoriteToggleInput,
  ): Promise<FavoriteMutationResponse | null> {
    const favorited = await this.isFavorited(userId, input);
    return favorited ? this.remove(userId, input) : this.add(userId, input);
  }

  private async resolvePublishedTarget(input: FavoriteToggleInput): Promise<ResolvedTarget | null> {
    if (input.targetType === 'PROJECT') {
      const project = await this.prisma.client.project.findFirst({
        where: { id: input.targetId, status: 'PUBLISHED' },
        select: { id: true, companyId: true },
      });
      return project
        ? {
            targetType: 'PROJECT',
            targetId: project.id,
            companyId: project.companyId,
            projectId: project.id,
          }
        : null;
    }

    const apartment = await this.prisma.client.apartment.findFirst({
      where: {
        id: input.targetId,
        floor: {
          status: 'PUBLISHED',
          building: { status: 'PUBLISHED', project: { status: 'PUBLISHED' } },
        },
      },
      select: {
        id: true,
        floor: {
          select: {
            building: {
              select: { project: { select: { id: true, companyId: true } } },
            },
          },
        },
      },
    });
    if (!apartment) {
      return null;
    }
    const project = apartment.floor.building.project;
    return {
      targetType: 'APARTMENT',
      targetId: apartment.id,
      companyId: project.companyId,
      projectId: project.id,
      apartmentId: apartment.id,
    };
  }

  private async loadProjects(ids: string[]): Promise<Map<string, ProjectTarget>> {
    const rows = await this.prisma.client.project.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        slug: true,
        company: { select: { name: true, slug: true } },
      },
    });
    return new Map(rows.map((row) => [row.id, row]));
  }

  private async loadApartments(ids: string[]): Promise<Map<string, ApartmentTarget>> {
    const rows = await this.prisma.client.apartment.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        code: true,
        status: true,
        priceAmd: true,
        priceVisibility: true,
        floor: {
          select: {
            building: {
              select: {
                project: {
                  select: {
                    name: true,
                    slug: true,
                    company: { select: { name: true, slug: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    return new Map(rows.map((row) => [row.id, row]));
  }

  private mapFavorite(
    row: FavoriteRow,
    projects: Map<string, ProjectTarget>,
    apartments: Map<string, ApartmentTarget>,
  ): FavoriteListItem | null {
    if (row.targetType === 'PROJECT') {
      const project = projects.get(row.targetId);
      return project ? mapProjectFavorite(row, project) : null;
    }
    const apartment = apartments.get(row.targetId);
    return apartment ? mapApartmentFavorite(row, apartment) : null;
  }

  private scheduleAnalytics(type: AnalyticsEventType, target: ResolvedTarget): void {
    void this.prisma.client.analyticsEvent
      .create({
        data: {
          type,
          companyId: target.companyId,
          projectId: target.projectId,
          apartmentId: target.apartmentId,
        },
      })
      .catch((error: unknown) => {
        this.logger.warn(`Favorite analytics insert failed: ${String(error)}`);
      });
  }
}

function idsForType(rows: FavoriteRow[], type: FavoriteTargetType): string[] {
  return rows.filter((row) => row.targetType === type).map((row) => row.targetId);
}

function mapProjectFavorite(row: FavoriteRow, project: ProjectTarget): FavoriteListItem {
  return {
    ...row,
    targetType: 'PROJECT',
    title: project.name,
    companyName: project.company.name,
    companySlug: project.company.slug,
    projectName: project.name,
    projectSlug: project.slug,
    apartmentStatus: null,
    priceDisplay: null,
    priceAmd: null,
  };
}

function mapApartmentFavorite(row: FavoriteRow, apartment: ApartmentTarget): FavoriteListItem {
  const project = apartment.floor.building.project;
  const price = resolveFavoritePrice(apartment.priceVisibility, apartment.priceAmd);
  return {
    ...row,
    targetType: 'APARTMENT',
    title: apartment.code,
    companyName: project.company.name,
    companySlug: project.company.slug,
    projectName: project.name,
    projectSlug: project.slug,
    apartmentStatus: apartment.status,
    ...price,
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
