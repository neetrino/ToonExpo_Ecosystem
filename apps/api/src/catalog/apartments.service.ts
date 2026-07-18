import { Injectable, NotFoundException } from "@nestjs/common";
import type { ApartmentDetail } from "@toonexpo/contracts";

import { PrismaService } from "../prisma/prisma.service.js";
import { PUBLIC_PUBLICATION_STATUS } from "./catalog.constants.js";
import {
  decimalToString,
  shouldRevealPublicPrice,
  toMediaSummary,
} from "./mappers/catalog.mapper.js";

@Injectable()
export class ApartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getApartmentById(apartmentId: string): Promise<ApartmentDetail> {
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

    const revealPrice = shouldRevealPublicPrice(apartment.priceVisibility);

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
      description: apartment.description,
      matterportUrl: apartment.matterportUrl,
      external3dUrl: apartment.external3dUrl,
      orientation: apartment.orientation,
      viewType: apartment.viewType,
      features: apartment.features,
      plan: toMediaSummary(apartment.planMedia),
      project: {
        id: apartment.project.id,
        name: apartment.project.name,
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
        name: apartment.project.builderCompany.name,
        logoUrl: apartment.project.builderCompany.logoMedia?.fileUrl ?? null,
      },
    };
  }
}
