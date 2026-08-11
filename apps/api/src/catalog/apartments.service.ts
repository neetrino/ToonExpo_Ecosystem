import { Injectable, NotFoundException } from '@nestjs/common';
import type { ApartmentDetail, ApartmentListItem, PaginatedResponse } from '@toonexpo/contracts';
import type { Prisma } from '@toonexpo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { AnalyticsService } from '../analytics/analytics.service.js';
import {
  CATALOG_DEFAULT_PAGE_SIZE,
  PUBLIC_PUBLICATION_STATUS,
} from './catalog.constants.js';
import type { ListApartmentsQueryDto } from './dto/list-apartments.query.dto.js';
import type { CatalogViewerContext } from './projects.service.js';
import { decimalToString, shouldRevealPrice, toMediaSummary } from './mappers/catalog.mapper.js';
import { loadTranslations } from './utils/load-translations.js';
import {
  resolveCatalogLocale,
  resolveTranslatedName,
  resolveTranslatedValue,
  TRANSLATION_ENTITY,
  TRANSLATION_FIELD,
} from './utils/resolve-translation.js';

@Injectable()
export class ApartmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  /**
   * Lists published apartments (homepage featured band when `featuredOnHome`).
   */
  async listApartments(
    query: ListApartmentsQueryDto,
    viewer: CatalogViewerContext,
  ): Promise<PaginatedResponse<ApartmentListItem>> {
    const page = query.page;
    const pageSize = query.pageSize || CATALOG_DEFAULT_PAGE_SIZE;
    const locale = resolveCatalogLocale(viewer.locale ?? query.locale);
    const where: Prisma.ApartmentWhereInput = {
      publicationStatus: PUBLIC_PUBLICATION_STATUS,
      project: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
      building: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
      floor: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
      ...(query.featuredOnHome === true ? { featuredOnHome: true } : {}),
    };

    const [total, apartments] = await Promise.all([
      this.prisma.db.apartment.count({ where }),
      this.prisma.db.apartment.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
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
          projectId: true,
          coverMedia: true,
          project: {
            select: {
              id: true,
              name: true,
              locationText: true,
              city: true,
              district: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      }),
    ]);

    const translations = await loadTranslations(
      this.prisma.db,
      TRANSLATION_ENTITY.project,
      apartments.map((apartment) => apartment.project.id),
    );

    return {
      data: apartments.map((apartment) => {
        const revealPrice = shouldRevealPrice(apartment.priceVisibility, viewer.isAuthenticated);
        const projectName = resolveTranslatedName(
          translations,
          TRANSLATION_ENTITY.project,
          apartment.project.id,
          TRANSLATION_FIELD.name,
          locale,
          apartment.project.name,
        );

        return {
          id: apartment.id,
          number: apartment.number,
          salesStatus: apartment.salesStatus,
          rooms: apartment.rooms,
          bedrooms: apartment.bedrooms,
          bathrooms: apartment.bathrooms,
          areaTotal: decimalToString(apartment.areaTotal),
          price: revealPrice ? decimalToString(apartment.price) : null,
          priceCurrency: apartment.priceCurrency,
          priceVisibility: apartment.priceVisibility,
          projectId: apartment.projectId,
          projectName,
          locationText: apartment.project.locationText,
          city: apartment.project.city,
          district: apartment.project.district,
          latitude: decimalToString(apartment.project.latitude),
          longitude: decimalToString(apartment.project.longitude),
          cover:
            toMediaSummary(apartment.coverMedia),
        };
      }),
      meta: {
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
      },
    };
  }

  async getApartmentById(
    apartmentId: string,
    viewer: CatalogViewerContext,
  ): Promise<ApartmentDetail> {
    const locale = resolveCatalogLocale(viewer.locale);
    const apartment = await this.prisma.db.apartment.findFirst({
      where: {
        id: apartmentId,
        publicationStatus: PUBLIC_PUBLICATION_STATUS,
        project: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
        building: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
        floor: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
      },
      include: {
        planMedia: true,
        project: {
          include: {
            builderCompany: { include: { logoMedia: true } },
          },
        },
        building: true,
        floor: true,
      },
    });

    if (!apartment) {
      throw new NotFoundException('Apartment not found');
    }

    const translations = await this.loadApartmentTranslations(
      apartment.id,
      apartment.project.id,
      apartment.project.builderCompany.id,
    );
    const revealPrice = shouldRevealPrice(apartment.priceVisibility, viewer.isAuthenticated);

    const projectName = resolveTranslatedName(
      translations,
      TRANSLATION_ENTITY.project,
      apartment.project.id,
      TRANSLATION_FIELD.name,
      locale,
      apartment.project.name,
    );

    const builderName = resolveTranslatedName(
      translations,
      TRANSLATION_ENTITY.company,
      apartment.project.builderCompany.id,
      TRANSLATION_FIELD.name,
      locale,
      apartment.project.builderCompany.name,
    );

    const description = resolveTranslatedValue(
      translations,
      TRANSLATION_ENTITY.apartment,
      apartment.id,
      TRANSLATION_FIELD.description,
      locale,
      apartment.description,
    );

    this.analytics.track({
      eventType: 'apartment_view',
      apartmentId: apartment.id,
      projectId: apartment.projectId,
      buildingId: apartment.buildingId,
      floorId: apartment.floorId,
      companyId: apartment.project.builderCompany.id,
    });

    return {
      id: apartment.id,
      number: apartment.number,
      salesStatus: apartment.salesStatus,
      rooms: apartment.rooms,
      bedrooms: apartment.bedrooms,
      bathrooms: apartment.bathrooms,
      areaTotal: decimalToString(apartment.areaTotal),
      areaLiving: decimalToString(apartment.areaLiving),
      balconyArea: decimalToString(apartment.balconyArea),
      price: revealPrice ? decimalToString(apartment.price) : null,
      priceCurrency: apartment.priceCurrency,
      priceVisibility: apartment.priceVisibility,
      description,
      matterportUrl: apartment.matterportUrl,
      external3dUrl: apartment.external3dUrl,
      orientation: apartment.orientation,
      viewType: apartment.viewType,
      features: apartment.features,
      plan: toMediaSummary(apartment.planMedia),
      project: {
        id: apartment.project.id,
        name: projectName,
        slug: apartment.project.slug,
      },
      building: {
        id: apartment.building.id,
        name: apartment.building.name,
      },
      floor: {
        id: apartment.floor.id,
        number: apartment.floor.number,
        displayLabel: apartment.floor.displayLabel,
      },
      builder: {
        id: apartment.project.builderCompany.id,
        name: builderName,
        logoUrl: apartment.project.builderCompany.logoMedia?.fileUrl ?? null,
      },
    };
  }

  private async loadApartmentTranslations(
    apartmentId: string,
    projectId: string,
    builderId: string,
  ) {
    const [apartmentRows, projectRows, companyRows] = await Promise.all([
      loadTranslations(this.prisma.db, TRANSLATION_ENTITY.apartment, [apartmentId]),
      loadTranslations(this.prisma.db, TRANSLATION_ENTITY.project, [projectId]),
      loadTranslations(this.prisma.db, TRANSLATION_ENTITY.company, [builderId]),
    ]);

    return [...apartmentRows, ...projectRows, ...companyRows];
  }
}
