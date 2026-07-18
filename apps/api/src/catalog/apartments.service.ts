import { Injectable, NotFoundException } from "@nestjs/common";
import type { ApartmentDetail } from "@toonexpo/contracts";

import { PrismaService } from "../prisma/prisma.service.js";
import { PUBLIC_PUBLICATION_STATUS } from "./catalog.constants.js";
import type { CatalogViewerContext } from "./projects.service.js";
import {
  decimalToString,
  shouldRevealPrice,
  toMediaSummary,
} from "./mappers/catalog.mapper.js";
import { loadTranslations } from "./utils/load-translations.js";
import {
  resolveCatalogLocale,
  resolveTranslatedValue,
  TRANSLATION_ENTITY,
  TRANSLATION_FIELD,
} from "./utils/resolve-translation.js";

@Injectable()
export class ApartmentsService {
  constructor(private readonly prisma: PrismaService) {}

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
      throw new NotFoundException("Apartment not found");
    }

    const translations = await this.loadApartmentTranslations(
      apartment.id,
      apartment.project.id,
      apartment.project.builderCompany.id,
    );
    const revealPrice = shouldRevealPrice(
      apartment.priceVisibility,
      viewer.isAuthenticated,
    );

    const projectName =
      resolveTranslatedValue(
        translations,
        TRANSLATION_ENTITY.project,
        apartment.project.id,
        TRANSLATION_FIELD.name,
        locale,
        apartment.project.name,
      ) ?? apartment.project.name;

    const builderName =
      resolveTranslatedValue(
        translations,
        TRANSLATION_ENTITY.company,
        apartment.project.builderCompany.id,
        TRANSLATION_FIELD.name,
        locale,
        apartment.project.builderCompany.name,
      ) ?? apartment.project.builderCompany.name;

    const description = resolveTranslatedValue(
      translations,
      TRANSLATION_ENTITY.apartment,
      apartment.id,
      TRANSLATION_FIELD.description,
      locale,
      apartment.description,
    );

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
      loadTranslations(this.prisma.db, TRANSLATION_ENTITY.apartment, [
        apartmentId,
      ]),
      loadTranslations(this.prisma.db, TRANSLATION_ENTITY.project, [projectId]),
      loadTranslations(this.prisma.db, TRANSLATION_ENTITY.company, [builderId]),
    ]);

    return [...apartmentRows, ...projectRows, ...companyRows];
  }
}
