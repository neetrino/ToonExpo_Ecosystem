import { Injectable, NotFoundException } from '@nestjs/common';
import type { ApartmentDetail, ApartmentListItem, PaginatedResponse } from '@toonexpo/contracts';

import { findApartmentByRef } from '../common/utils/resolve-apartment-ref.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AnalyticsService } from '../analytics/analytics.service.js';
import { CATALOG_DEFAULT_PAGE_SIZE, PUBLIC_PUBLICATION_STATUS } from './catalog.constants.js';
import type { ListApartmentsQueryDto } from './dto/list-apartments.query.dto.js';
import type { CatalogViewerContext } from './projects.service.js';
import { toPublicFileUrl } from '../media/public-file-url.js';
import {
  decimalToString,
  shouldRevealCatalogPrice,
  toMediaSummary,
} from './mappers/catalog.mapper.js';
import { buildApartmentListWhere } from './utils/build-apartment-list-where.js';
import { loadTranslations } from './utils/load-translations.js';
import {
  resolveCatalogLocale,
  resolveCompanyDisplayName,
  resolveTranslatedName,
  resolveTranslatedValue,
  TRANSLATION_ENTITY,
  TRANSLATION_FIELD,
} from './utils/resolve-translation.js';

type GalleryMediaRow = {
  id: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  altText: string | null;
};

const orderApartmentGallery = (
  media: GalleryMediaRow[],
  coverMediaId: string | null,
): GalleryMediaRow[] => {
  if (coverMediaId == null || media.length === 0) {
    return media;
  }
  const cover = media.find((item) => item.id === coverMediaId);
  if (cover == null) {
    return media;
  }
  return [cover, ...media.filter((item) => item.id !== coverMediaId)];
};

@Injectable()
export class ApartmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  /**
   * Lists published apartments (Buy page filters + homepage featured band).
   */
  async listApartments(
    query: ListApartmentsQueryDto,
    viewer: CatalogViewerContext,
  ): Promise<PaginatedResponse<ApartmentListItem>> {
    const page = query.page;
    const pageSize = query.pageSize || CATALOG_DEFAULT_PAGE_SIZE;
    const locale = resolveCatalogLocale(viewer.locale ?? query.locale);
    const where = buildApartmentListWhere(query);

    const [total, apartments] = await Promise.all([
      this.prisma.db.apartment.count({ where }),
      this.prisma.db.apartment.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          slug: true,
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
          verified: true,
          coverMedia: true,
          building: { select: { priceOnRequestEnabled: true } },
          project: {
            select: {
              id: true,
              name: true,
              locationText: true,
              city: true,
              district: true,
              latitude: true,
              longitude: true,
              priceOnRequestEnabled: true,
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
        const priceOnRequest =
          apartment.building.priceOnRequestEnabled || apartment.project.priceOnRequestEnabled;
        const revealPrice = shouldRevealCatalogPrice(
          apartment.priceVisibility,
          viewer.isAuthenticated,
          priceOnRequest,
        );
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
          slug: apartment.slug,
          number: apartment.number,
          salesStatus: apartment.salesStatus,
          rooms: apartment.rooms,
          bedrooms: apartment.bedrooms,
          bathrooms: apartment.bathrooms,
          areaTotal: decimalToString(apartment.areaTotal),
          price: revealPrice ? decimalToString(apartment.price) : null,
          priceCurrency: apartment.priceCurrency,
          priceVisibility: apartment.priceVisibility,
          priceOnRequest,
          projectId: apartment.projectId,
          projectName,
          locationText: apartment.project.locationText,
          city: apartment.project.city,
          district: apartment.project.district,
          latitude: decimalToString(apartment.project.latitude),
          longitude: decimalToString(apartment.project.longitude),
          cover: toMediaSummary(apartment.coverMedia),
          verified: apartment.verified,
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
    apartmentRef: string,
    viewer: CatalogViewerContext,
  ): Promise<ApartmentDetail> {
    const locale = resolveCatalogLocale(viewer.locale);
    const resolved = await findApartmentByRef(this.prisma, apartmentRef, { id: true });
    if (!resolved) {
      throw new NotFoundException('Apartment not found');
    }

    const apartment = await this.prisma.db.apartment.findFirst({
      where: {
        id: resolved.id,
        publicationStatus: PUBLIC_PUBLICATION_STATUS,
        project: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
        building: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
        floor: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
      },
      include: {
        planMedia: true,
        coverMedia: true,
        galleryImages: {
          orderBy: { sortOrder: 'asc' },
          include: { mediaAsset: true },
        },
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
    const priceOnRequest =
      apartment.building.priceOnRequestEnabled || apartment.project.priceOnRequestEnabled;
    const revealPrice = shouldRevealCatalogPrice(
      apartment.priceVisibility,
      viewer.isAuthenticated,
      priceOnRequest,
    );

    const projectName = resolveTranslatedName(
      translations,
      TRANSLATION_ENTITY.project,
      apartment.project.id,
      TRANSLATION_FIELD.name,
      locale,
      apartment.project.name,
    );

    const builderName = resolveCompanyDisplayName(
      translations,
      apartment.project.builderCompany.id,
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
      slug: apartment.slug,
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
      priceOnRequest,
      description,
      matterportUrl: apartment.matterportUrl,
      external3dUrl: apartment.external3dUrl,
      orientation: apartment.orientation,
      viewType: apartment.viewType,
      features: apartment.features,
      plan: toMediaSummary(apartment.planMedia),
      cover: toMediaSummary(apartment.coverMedia),
      verified: apartment.verified,
      gallery: orderApartmentGallery(
        apartment.galleryImages.map((row) => row.mediaAsset),
        apartment.coverMediaId,
      )
        .map((media) => toMediaSummary(media))
        .filter((item): item is NonNullable<typeof item> => item != null),
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
        logoUrl: apartment.project.builderCompany.logoMedia
          ? toPublicFileUrl(apartment.project.builderCompany.logoMedia.fileUrl)
          : null,
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
