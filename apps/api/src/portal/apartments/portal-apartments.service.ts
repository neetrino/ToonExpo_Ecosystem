import { BadRequestException, Injectable } from '@nestjs/common';
import type { PortalApartmentDetail } from '@toonexpo/contracts';
import { ApartmentSalesStatus, PublicationStatus } from '@toonexpo/db';

import { loadTranslations } from '../../catalog/utils/load-translations.js';
import { TRANSLATION_ENTITY, TRANSLATION_FIELD } from '../../catalog/utils/resolve-translation.js';
import { WebRevalidationService } from '../../common/web-revalidation/web-revalidation.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  BulkCreatePortalApartmentsDto,
  CreatePortalApartmentDto,
  UpdatePortalApartmentDto,
} from '../dto/portal-apartment.dto.js';
import type { UpdatePortalPublicationDto } from '../dto/update-portal-publication.dto.js';
import { mapPortalApartment } from '../mappers/portal.mapper.js';
import { entityNotFound } from '../utils/access.js';
import { groupPortalTranslations } from '../utils/group-translations.js';
import { requireOwnedApartment, requireOwnedFloor } from '../utils/ownership.js';
import { upsertTranslations } from '../utils/upsert-translations.js';
import { buildApartmentUpdateData, createPortalApartmentRow } from './apartment-write.helpers.js';

const APARTMENT_TRANSLATION_FIELDS = [TRANSLATION_FIELD.description] as const;

@Injectable()
export class PortalApartmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webRevalidation: WebRevalidationService,
  ) {}

  async listByFloor(companyId: string, floorId: string): Promise<PortalApartmentDetail[]> {
    await requireOwnedFloor(this.prisma, floorId, companyId);
    const apartments = await this.prisma.db.apartment.findMany({
      where: { floorId },
      orderBy: [{ number: 'asc' }],
      include: {
        planMedia: {
          select: {
            id: true,
            fileUrl: true,
            thumbnailUrl: true,
            altText: true,
          },
        },
        floor: {
          select: {
            number: true,
            displayLabel: true,
            building: {
              select: {
                name: true,
                project: {
                  select: {
                    name: true,
                    builderCompany: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    return apartments.map((apartment) => mapPortalApartment(apartment));
  }

  async getById(companyId: string, apartmentId: string): Promise<PortalApartmentDetail> {
    const owned = await requireOwnedApartment(this.prisma, apartmentId, companyId);
    const apartment = await this.prisma.db.apartment.findUniqueOrThrow({
      where: { id: owned.id },
    });
    return this.toApartmentDetail(apartment);
  }

  async create(
    companyId: string,
    userId: string,
    floorId: string,
    dto: CreatePortalApartmentDto,
  ): Promise<PortalApartmentDetail> {
    const floor = await requireOwnedFloor(this.prisma, floorId, companyId);
    const apartment = await createPortalApartmentRow(this.prisma.db, {
      userId,
      projectId: floor.building.projectId,
      buildingId: floor.buildingId,
      floorId,
      dto,
    });
    return this.toApartmentDetail(apartment);
  }

  async createBulk(
    companyId: string,
    userId: string,
    floorId: string,
    dto: BulkCreatePortalApartmentsDto,
  ): Promise<PortalApartmentDetail[]> {
    const floor = await requireOwnedFloor(this.prisma, floorId, companyId);
    const created: PortalApartmentDetail[] = [];
    for (const item of dto.apartments) {
      const apartment = await createPortalApartmentRow(this.prisma.db, {
        userId,
        projectId: floor.building.projectId,
        buildingId: floor.buildingId,
        floorId,
        dto: item,
      });
      created.push(await this.toApartmentDetail(apartment));
    }
    return created;
  }

  async update(
    companyId: string,
    userId: string,
    apartmentId: string,
    dto: UpdatePortalApartmentDto,
  ): Promise<PortalApartmentDetail> {
    const existing = await this.prisma.db.apartment.findFirst({
      where: {
        id: apartmentId,
        project: { builderCompanyId: companyId },
      },
    });
    if (!existing) {
      throw entityNotFound('Apartment');
    }

    const nextSalesStatus =
      dto.salesStatus !== undefined ? (dto.salesStatus as ApartmentSalesStatus) : undefined;
    const salesStatusChanged =
      nextSalesStatus !== undefined && nextSalesStatus !== existing.salesStatus;

    const apartment = await this.prisma.db.$transaction(async (tx) => {
      if (salesStatusChanged && nextSalesStatus) {
        await tx.apartmentStatusHistory.create({
          data: {
            apartmentId,
            previousStatus: existing.salesStatus,
            newStatus: nextSalesStatus,
            changedByUserId: userId,
            ...(dto.statusChangeReason !== undefined ? { reason: dto.statusChangeReason } : {}),
          },
        });
      }

      return tx.apartment.update({
        where: { id: apartmentId },
        data: buildApartmentUpdateData(dto, userId, salesStatusChanged),
      });
    });

    if (dto.translations) {
      await upsertTranslations(this.prisma.db, {
        entityType: TRANSLATION_ENTITY.apartment,
        entityId: apartment.id,
        fields: {
          [TRANSLATION_FIELD.description]: dto.translations.description,
        },
        updatedByUserId: userId,
      });
    }

    return this.toApartmentDetail(apartment);
  }

  async updatePublication(
    companyId: string,
    userId: string,
    apartmentId: string,
    dto: UpdatePortalPublicationDto,
  ): Promise<PortalApartmentDetail> {
    const owned = await requireOwnedApartment(this.prisma, apartmentId, companyId);
    const apartment = await this.prisma.db.apartment.update({
      where: { id: apartmentId },
      data: {
        publicationStatus: dto.publicationStatus as PublicationStatus,
        updatedByUserId: userId,
      },
    });
    this.webRevalidation.revalidateCatalog(owned.projectId);
    return this.toApartmentDetail(apartment);
  }

  async remove(companyId: string, apartmentId: string): Promise<void> {
    const apartment = await this.prisma.db.apartment.findFirst({
      where: {
        id: apartmentId,
        project: { builderCompanyId: companyId },
      },
      select: { id: true, publicationStatus: true },
    });
    if (!apartment) {
      throw entityNotFound('Apartment');
    }
    if (apartment.publicationStatus !== PublicationStatus.draft) {
      throw new BadRequestException('Only draft apartments can be deleted');
    }
    await this.prisma.db.apartment.delete({ where: { id: apartmentId } });
  }

  private async toApartmentDetail(apartment: { id: string }): Promise<PortalApartmentDetail> {
    const full = await this.prisma.db.apartment.findUniqueOrThrow({
      where: { id: apartment.id },
      include: {
        planMedia: {
          select: {
            id: true,
            fileUrl: true,
            thumbnailUrl: true,
            altText: true,
          },
        },
        floor: {
          select: {
            number: true,
            displayLabel: true,
            building: {
              select: {
                name: true,
                project: {
                  select: {
                    name: true,
                    builderCompany: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    const rows = await loadTranslations(this.prisma.db, TRANSLATION_ENTITY.apartment, [full.id]);
    const translations = groupPortalTranslations(rows, APARTMENT_TRANSLATION_FIELDS);
    return mapPortalApartment(full, translations);
  }
}
