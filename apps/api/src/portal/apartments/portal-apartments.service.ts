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
import { ensurePublishedInventoryChain } from '../utils/ensure-published-inventory-chain.js';
import { groupPortalTranslations } from '../utils/group-translations.js';
import { requireOwnedApartment, requireOwnedFloor } from '../utils/ownership.js';
import { upsertTranslations } from '../utils/upsert-translations.js';
import { buildApartmentUpdateData, createPortalApartmentRow } from './apartment-write.helpers.js';
import {
  apartmentGalleryInclude,
  replaceApartmentGallery,
  syncApartmentGalleryOnUpdate,
} from './apartment-gallery.helpers.js';

const APARTMENT_TRANSLATION_FIELDS = [TRANSLATION_FIELD.description] as const;

const APARTMENT_MEDIA_SELECT = {
  id: true,
  fileUrl: true,
  thumbnailUrl: true,
  altText: true,
} as const;

const APARTMENT_DETAIL_INCLUDE = {
  planMedia: { select: APARTMENT_MEDIA_SELECT },
  coverMedia: { select: APARTMENT_MEDIA_SELECT },
  tinderMedia: { select: APARTMENT_MEDIA_SELECT },
  ...apartmentGalleryInclude,
  floor: {
    select: {
      number: true,
      displayLabel: true,
      floorplanMediaId: true,
      floorplanMedia: { select: APARTMENT_MEDIA_SELECT },
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
} as const;

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
      include: APARTMENT_DETAIL_INCLUDE,
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
    const projectId = floor.building.projectId;
    const apartment = await createPortalApartmentRow(this.prisma.db, {
      userId,
      projectId,
      buildingId: floor.buildingId,
      floorId,
      dto,
      publicationStatus:
        floor.building.project.publicationStatus === PublicationStatus.published
          ? PublicationStatus.published
          : PublicationStatus.draft,
    });

    const initialGallery =
      dto.galleryMediaIds ??
      (dto.coverMediaId != null && dto.coverMediaId.trim().length > 0
        ? [dto.coverMediaId]
        : dto.planMediaId != null && dto.planMediaId.trim().length > 0
          ? [dto.planMediaId]
          : undefined);
    if (initialGallery !== undefined) {
      await replaceApartmentGallery({
        db: this.prisma.db,
        apartmentId: apartment.id,
        companyId,
        galleryMediaIds: initialGallery,
        coverMediaId: dto.coverMediaId ?? dto.planMediaId,
      });
    }

    if (apartment.publicationStatus === PublicationStatus.published) {
      await ensurePublishedInventoryChain(this.prisma, {
        projectId,
        buildingId: floor.buildingId,
        floorId,
        apartmentId: apartment.id,
      });
      this.webRevalidation.revalidateCatalog(projectId);
    }
    return this.toApartmentDetail(apartment);
  }

  async createBulk(
    companyId: string,
    userId: string,
    floorId: string,
    dto: BulkCreatePortalApartmentsDto,
  ): Promise<PortalApartmentDetail[]> {
    const floor = await requireOwnedFloor(this.prisma, floorId, companyId);
    const projectId = floor.building.projectId;
    const publishWithProject =
      floor.building.project.publicationStatus === PublicationStatus.published;
    const created: PortalApartmentDetail[] = [];
    for (const item of dto.apartments) {
      const apartment = await createPortalApartmentRow(this.prisma.db, {
        userId,
        projectId,
        buildingId: floor.buildingId,
        floorId,
        dto: item,
        publicationStatus: publishWithProject
          ? PublicationStatus.published
          : PublicationStatus.draft,
      });
      if (publishWithProject) {
        await ensurePublishedInventoryChain(this.prisma, {
          projectId,
          buildingId: floor.buildingId,
          floorId,
          apartmentId: apartment.id,
        });
      }
      created.push(await this.toApartmentDetail(apartment));
    }
    if (publishWithProject && created.length > 0) {
      this.webRevalidation.revalidateCatalog(projectId);
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
          },
        });
      }

      const updatePayload: UpdatePortalApartmentDto = { ...dto };
      if (dto.galleryMediaIds !== undefined) {
        delete updatePayload.coverMediaId;
      }

      const updated = await tx.apartment.update({
        where: { id: apartmentId },
        data: buildApartmentUpdateData(updatePayload, userId, salesStatusChanged),
      });

      if (dto.galleryMediaIds !== undefined || dto.coverMediaId !== undefined) {
        await syncApartmentGalleryOnUpdate({
          db: tx,
          apartmentId,
          companyId,
          galleryMediaIds: dto.galleryMediaIds,
          coverMediaId: dto.coverMediaId,
        });
      } else if (dto.planMediaId != null && dto.planMediaId.trim().length > 0) {
        // Apartment plan becomes the gallery Main when set.
        await syncApartmentGalleryOnUpdate({
          db: tx,
          apartmentId,
          companyId,
          coverMediaId: dto.planMediaId,
        });
      }

      return updated;
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
    const nextStatus = dto.publicationStatus as PublicationStatus;
    if (nextStatus === PublicationStatus.published) {
      await ensurePublishedInventoryChain(this.prisma, {
        projectId: owned.projectId,
        buildingId: owned.buildingId,
        floorId: owned.floorId,
        apartmentId: owned.id,
      });
    }
    const apartment = await this.prisma.db.apartment.update({
      where: { id: apartmentId },
      data: {
        publicationStatus: nextStatus,
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
      include: APARTMENT_DETAIL_INCLUDE,
    });
    const rows = await loadTranslations(this.prisma.db, TRANSLATION_ENTITY.apartment, [full.id]);
    const translations = groupPortalTranslations(rows, APARTMENT_TRANSLATION_FIELDS);
    return mapPortalApartment(full, translations);
  }
}
