import { BadRequestException, Injectable } from "@nestjs/common";
import type { PortalApartmentDetail } from "@toonexpo/contracts";
import { ApartmentSalesStatus, PublicationStatus } from "@toonexpo/db";

import { loadTranslations } from "../../catalog/utils/load-translations.js";
import {
  TRANSLATION_ENTITY,
  TRANSLATION_FIELD,
} from "../../catalog/utils/resolve-translation.js";
import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import { WebRevalidationService } from "../../common/web-revalidation/web-revalidation.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import type {
  BulkCreatePortalApartmentsDto,
  CreatePortalApartmentDto,
  UpdatePortalApartmentDto,
} from "../dto/portal-apartment.dto.js";
import type { UpdatePortalPublicationDto } from "../dto/update-portal-publication.dto.js";
import { mapPortalApartment } from "../mappers/portal.mapper.js";
import { assertCompanyAdmin, entityNotFound } from "../utils/access.js";
import { groupPortalTranslations } from "../utils/group-translations.js";
import {
  requireOwnedApartment,
  requireOwnedFloor,
} from "../utils/ownership.js";
import { upsertTranslations } from "../utils/upsert-translations.js";
import {
  buildApartmentUpdateData,
  createPortalApartmentRow,
} from "./apartment-write.helpers.js";

const APARTMENT_TRANSLATION_FIELDS = [TRANSLATION_FIELD.description] as const;

@Injectable()
export class PortalApartmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webRevalidation: WebRevalidationService,
  ) {}

  async listByFloor(
    member: CompanyMemberContext,
    floorId: string,
  ): Promise<PortalApartmentDetail[]> {
    await requireOwnedFloor(this.prisma, floorId, member.companyId);
    const apartments = await this.prisma.db.apartment.findMany({
      where: { floorId },
      orderBy: [{ number: "asc" }],
    });
    return apartments.map((apartment) => mapPortalApartment(apartment));
  }

  async getById(
    member: CompanyMemberContext,
    apartmentId: string,
  ): Promise<PortalApartmentDetail> {
    const owned = await requireOwnedApartment(
      this.prisma,
      apartmentId,
      member.companyId,
    );
    const apartment = await this.prisma.db.apartment.findUniqueOrThrow({
      where: { id: owned.id },
    });
    return this.toApartmentDetail(apartment);
  }

  async create(
    member: CompanyMemberContext,
    userId: string,
    floorId: string,
    dto: CreatePortalApartmentDto,
  ): Promise<PortalApartmentDetail> {
    const floor = await requireOwnedFloor(
      this.prisma,
      floorId,
      member.companyId,
    );
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
    member: CompanyMemberContext,
    userId: string,
    floorId: string,
    dto: BulkCreatePortalApartmentsDto,
  ): Promise<PortalApartmentDetail[]> {
    const floor = await requireOwnedFloor(
      this.prisma,
      floorId,
      member.companyId,
    );
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
    member: CompanyMemberContext,
    userId: string,
    apartmentId: string,
    dto: UpdatePortalApartmentDto,
  ): Promise<PortalApartmentDetail> {
    const existing = await this.prisma.db.apartment.findFirst({
      where: {
        id: apartmentId,
        project: { builderCompanyId: member.companyId },
      },
    });
    if (!existing) {
      throw entityNotFound("Apartment");
    }

    const nextSalesStatus =
      dto.salesStatus !== undefined
        ? (dto.salesStatus as ApartmentSalesStatus)
        : undefined;
    const salesStatusChanged =
      nextSalesStatus !== undefined &&
      nextSalesStatus !== existing.salesStatus;

    const apartment = await this.prisma.db.$transaction(async (tx) => {
      if (salesStatusChanged && nextSalesStatus) {
        await tx.apartmentStatusHistory.create({
          data: {
            apartmentId,
            previousStatus: existing.salesStatus,
            newStatus: nextSalesStatus,
            changedByUserId: userId,
            ...(dto.statusChangeReason !== undefined
              ? { reason: dto.statusChangeReason }
              : {}),
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
    member: CompanyMemberContext,
    userId: string,
    apartmentId: string,
    dto: UpdatePortalPublicationDto,
  ): Promise<PortalApartmentDetail> {
    assertCompanyAdmin(member);
    const owned = await requireOwnedApartment(
      this.prisma,
      apartmentId,
      member.companyId,
    );
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

  async remove(
    member: CompanyMemberContext,
    apartmentId: string,
  ): Promise<void> {
    assertCompanyAdmin(member);
    const apartment = await this.prisma.db.apartment.findFirst({
      where: {
        id: apartmentId,
        project: { builderCompanyId: member.companyId },
      },
      select: { id: true, publicationStatus: true },
    });
    if (!apartment) {
      throw entityNotFound("Apartment");
    }
    if (apartment.publicationStatus !== PublicationStatus.draft) {
      throw new BadRequestException("Only draft apartments can be deleted");
    }
    await this.prisma.db.apartment.delete({ where: { id: apartmentId } });
  }

  private async toApartmentDetail(
    apartment: Parameters<typeof mapPortalApartment>[0],
  ): Promise<PortalApartmentDetail> {
    const rows = await loadTranslations(
      this.prisma.db,
      TRANSLATION_ENTITY.apartment,
      [apartment.id],
    );
    const translations = groupPortalTranslations(
      rows,
      APARTMENT_TRANSLATION_FIELDS,
    );
    return mapPortalApartment(apartment, translations);
  }
}
