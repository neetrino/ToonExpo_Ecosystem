import { Injectable, NotFoundException } from '@nestjs/common';
import type { PaginatedResponse, ProjectDetail, ProjectListItem } from '@toonexpo/contracts';
import { ApartmentSalesStatus, type Prisma, PublicationStatus } from '@toonexpo/db';
import { findProjectByRef } from '../common/utils/resolve-project-ref.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AnalyticsService } from '../analytics/analytics.service.js';
import { CATALOG_DEFAULT_PAGE_SIZE, PUBLIC_PUBLICATION_STATUS } from './catalog.constants.js';
import type { ListProjectsQueryDto } from './dto/list-projects.query.dto.js';
import { publishedApartmentWhere } from './mappers/catalog.mapper.js';
import { mapProjectDetail, mapProjectListItem } from './mappers/project.mapper.js';
import { loadTranslations } from './utils/load-translations.js';
import { resolveCatalogLocale, TRANSLATION_ENTITY } from './utils/resolve-translation.js';
import { buildRoomsFilter } from './utils/rooms-filter.js';

export type CatalogViewerContext = {
  locale?: string | undefined;
  isAuthenticated: boolean;
};

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  async listProjects(
    query: ListProjectsQueryDto,
    viewer: CatalogViewerContext,
  ): Promise<PaginatedResponse<ProjectListItem>> {
    const page = query.page;
    const pageSize = query.pageSize || CATALOG_DEFAULT_PAGE_SIZE;
    const where = this.buildListWhere(query);
    const locale = resolveCatalogLocale(viewer.locale ?? query.locale);

    const [total, projects] = await Promise.all([
      this.prisma.db.project.count({ where }),
      this.prisma.db.project.findMany({
        where,
        orderBy: query.featuredOnHome === true ? [{ updatedAt: 'desc' }] : [{ createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          builderCompany: { include: { logoMedia: true } },
          coverMedia: true,
          apartments: {
            where: publishedApartmentWhere(),
            select: {
              salesStatus: true,
              price: true,
              priceCurrency: true,
              priceVisibility: true,
              building: { select: { priceOnRequestEnabled: true } },
            },
          },
          buildings: {
            where: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
            select: { priceOnRequestEnabled: true },
          },
        },
      }),
    ]);

    const translations = await this.loadProjectBundleTranslations(
      projects.map((project) => ({
        id: project.id,
        builderId: project.builderCompany.id,
      })),
    );

    return {
      data: projects.map((project) =>
        mapProjectListItem(project, {
          locale,
          isAuthenticated: viewer.isAuthenticated,
          translations,
        }),
      ),
      meta: {
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
      },
    };
  }

  async getProjectById(projectRef: string, viewer: CatalogViewerContext): Promise<ProjectDetail> {
    const locale = resolveCatalogLocale(viewer.locale);
    const resolved = await findProjectByRef(this.prisma, projectRef, { id: true });
    if (!resolved) {
      throw new NotFoundException('Project not found');
    }

    const project = await this.prisma.db.project.findFirst({
      where: {
        id: resolved.id,
        publicationStatus: PUBLIC_PUBLICATION_STATUS,
      },
      include: {
        builderCompany: { include: { logoMedia: true } },
        coverMedia: true,
        buildings: {
          where: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
          orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
          include: {
            coverMedia: true,
            floors: {
              where: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
              orderBy: [{ displayOrder: 'asc' }, { number: 'asc' }],
              include: {
                apartments: {
                  where: publishedApartmentWhere(),
                  orderBy: [{ number: 'asc' }],
                  select: {
                    id: true,
                    number: true,
                    salesStatus: true,
                    rooms: true,
                    bedrooms: true,
                    bathrooms: true,
                    areaTotal: true,
                    price: true,
                    priceCurrency: true,
                    priceVisibility: true,
                    tinderMedia: true,
                  },
                },
              },
            },
            apartments: {
              where: publishedApartmentWhere(),
              select: { salesStatus: true },
            },
          },
        },
        apartments: {
          where: publishedApartmentWhere(),
          select: {
            salesStatus: true,
            price: true,
            priceCurrency: true,
            priceVisibility: true,
            building: { select: { priceOnRequestEnabled: true } },
          },
        },
        bankPartnerOffers: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          include: {
            partnerCompany: {
              select: {
                name: true,
                logoMedia: { select: { fileUrl: true } },
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const translations = await this.loadProjectBundleTranslations([
      { id: project.id, builderId: project.builderCompany.id },
    ]);

    this.analytics.track({
      eventType: 'project_view',
      projectId: project.id,
      companyId: project.builderCompanyId,
    });

    return mapProjectDetail(project, {
      locale,
      isAuthenticated: viewer.isAuthenticated,
      translations,
    });
  }

  buildListWhere(query: ListProjectsQueryDto): Prisma.ProjectWhereInput {
    const apartmentFilter = this.buildApartmentFilter(query);
    const andClauses: Prisma.ProjectWhereInput[] = [];
    const where: Prisma.ProjectWhereInput = {
      publicationStatus: PublicationStatus.published,
    };

    if (query.featuredOnHome === true) {
      where.featuredOnHome = true;
    }

    if (query.city) {
      const cities = query.city
        .split(',')
        .map((city) => city.trim())
        .filter((city) => city.length > 0);
      const [firstCity] = cities;
      if (cities.length === 1 && firstCity != null) {
        where.city = { equals: firstCity, mode: 'insensitive' };
      } else if (cities.length > 1) {
        andClauses.push({
          OR: cities.map((city) => ({
            city: { equals: city, mode: 'insensitive' as const },
          })),
        });
      }
    }

    if (query.builderId) {
      where.builderCompanyId = query.builderId;
    }

    const keyword = query.q?.trim();
    if (keyword != null && keyword.length > 0) {
      andClauses.push({
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { city: { contains: keyword, mode: 'insensitive' } },
          { district: { contains: keyword, mode: 'insensitive' } },
          { locationText: { contains: keyword, mode: 'insensitive' } },
          { builderCompany: { name: { contains: keyword, mode: 'insensitive' } } },
        ],
      });
    }

    if (apartmentFilter) {
      where.apartments = { some: apartmentFilter };
    }

    if (andClauses.length > 0) {
      where.AND = andClauses;
    }

    return where;
  }

  buildApartmentFilter(query: ListProjectsQueryDto): Prisma.ApartmentWhereInput | undefined {
    const hasFilter =
      query.salesStatus != null ||
      query.minPrice != null ||
      query.maxPrice != null ||
      (query.rooms != null && query.rooms.length > 0);

    if (!hasFilter) {
      return undefined;
    }

    const filter: Prisma.ApartmentWhereInput = {
      ...publishedApartmentWhere(),
    };

    if (query.salesStatus) {
      filter.salesStatus = query.salesStatus as ApartmentSalesStatus;
    }

    if (query.rooms != null && query.rooms.length > 0) {
      Object.assign(filter, buildRoomsFilter(query.rooms));
    }

    if (query.minPrice != null || query.maxPrice != null) {
      filter.price = {};
      if (query.minPrice != null) {
        filter.price.gte = query.minPrice;
      }
      if (query.maxPrice != null) {
        filter.price.lte = query.maxPrice;
      }
      filter.priceVisibility = 'public';
      filter.building = { priceOnRequestEnabled: false };
    }

    return filter;
  }

  private async loadProjectBundleTranslations(projects: Array<{ id: string; builderId: string }>) {
    const projectIds = projects.map((project) => project.id);
    const builderIds = [...new Set(projects.map((project) => project.builderId))];

    const [projectRows, companyRows] = await Promise.all([
      loadTranslations(this.prisma.db, TRANSLATION_ENTITY.project, projectIds),
      loadTranslations(this.prisma.db, TRANSLATION_ENTITY.company, builderIds),
    ]);

    return [...projectRows, ...companyRows];
  }
}
