import {
  ApartmentSalesStatus,
  CrmStatusSource,
  PriceVisibility,
  PublicationStatus,
  type Prisma,
} from "@toonexpo/db";

import {
  TRANSLATION_ENTITY,
  TRANSLATION_FIELD,
} from "../../catalog/utils/resolve-translation.js";
import type {
  CreatePortalApartmentDto,
  UpdatePortalApartmentDto,
} from "../dto/portal-apartment.dto.js";
import { DEFAULT_PRICE_CURRENCY } from "../portal.constants.js";
import { upsertTranslations } from "../utils/upsert-translations.js";

type ApartmentRow = {
  id: string;
  projectId: string;
  buildingId: string;
  floorId: string;
  number: string;
  salesStatus: ApartmentSalesStatus;
  publicationStatus: PublicationStatus;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaTotal: Prisma.Decimal | null;
  areaLiving: Prisma.Decimal | null;
  balconyArea: Prisma.Decimal | null;
  price: Prisma.Decimal | null;
  priceCurrency: string;
  priceVisibility: PriceVisibility;
  description: string | null;
  matterportUrl: string | null;
  external3dUrl: string | null;
  orientation: string | null;
  viewType: string | null;
  features: Prisma.JsonValue;
  planMediaId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type DbClient = {
  apartment: {
    create: (args: {
      data: Prisma.ApartmentUncheckedCreateInput;
    }) => Promise<ApartmentRow>;
  };
  translation: {
    upsert: (args: {
      where: Prisma.TranslationWhereUniqueInput;
      create: Prisma.TranslationCreateInput;
      update: Prisma.TranslationUpdateInput;
    }) => Promise<unknown>;
  };
};

/**
 * Creates one draft apartment and optional description translations.
 */
export const createPortalApartmentRow = async (
  db: DbClient,
  params: {
    userId: string;
    projectId: string;
    buildingId: string;
    floorId: string;
    dto: CreatePortalApartmentDto;
  },
): Promise<ApartmentRow> => {
  const salesStatus =
    (params.dto.salesStatus as ApartmentSalesStatus | undefined) ??
    ApartmentSalesStatus.available;
  const dto = params.dto;

  const apartment = await db.apartment.create({
    data: {
      projectId: params.projectId,
      buildingId: params.buildingId,
      floorId: params.floorId,
      number: dto.number,
      salesStatus,
      publicationStatus: PublicationStatus.draft,
      priceCurrency: DEFAULT_PRICE_CURRENCY,
      priceVisibility:
        (dto.priceVisibility as PriceVisibility | undefined) ??
        PriceVisibility.public,
      crmStatusSource: CrmStatusSource.manual,
      createdByUserId: params.userId,
      updatedByUserId: params.userId,
      lastStatusChangedAt: new Date(),
      lastStatusChangedByUserId: params.userId,
      statusHistory: {
        create: {
          previousStatus: null,
          newStatus: salesStatus,
          changedByUserId: params.userId,
          reason: "initial",
        },
      },
      ...(dto.rooms !== undefined ? { rooms: dto.rooms } : {}),
      ...(dto.bedrooms !== undefined ? { bedrooms: dto.bedrooms } : {}),
      ...(dto.bathrooms !== undefined ? { bathrooms: dto.bathrooms } : {}),
      ...(dto.areaTotal !== undefined ? { areaTotal: dto.areaTotal } : {}),
      ...(dto.areaLiving !== undefined ? { areaLiving: dto.areaLiving } : {}),
      ...(dto.balconyArea !== undefined
        ? { balconyArea: dto.balconyArea }
        : {}),
      ...(dto.price !== undefined ? { price: dto.price } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description }
        : {}),
      ...(dto.matterportUrl !== undefined
        ? { matterportUrl: dto.matterportUrl }
        : {}),
      ...(dto.external3dUrl !== undefined
        ? { external3dUrl: dto.external3dUrl }
        : {}),
      ...(dto.orientation !== undefined
        ? { orientation: dto.orientation }
        : {}),
      ...(dto.viewType !== undefined ? { viewType: dto.viewType } : {}),
      ...(dto.features !== undefined
        ? { features: dto.features as Prisma.InputJsonValue }
        : {}),
      ...(dto.planMediaId !== undefined
        ? { planMediaId: dto.planMediaId }
        : {}),
    },
  });

  if (dto.translations) {
    await upsertTranslations(db, {
      entityType: TRANSLATION_ENTITY.apartment,
      entityId: apartment.id,
      fields: {
        [TRANSLATION_FIELD.description]: dto.translations.description,
      },
      updatedByUserId: params.userId,
    });
  }

  return apartment;
};

/**
 * Builds Prisma update input for apartment PATCH.
 */
export const buildApartmentUpdateData = (
  dto: UpdatePortalApartmentDto,
  userId: string,
  salesStatusChanged: boolean,
): Prisma.ApartmentUpdateInput => ({
  ...(dto.number !== undefined ? { number: dto.number } : {}),
  ...(dto.rooms !== undefined ? { rooms: dto.rooms } : {}),
  ...(dto.bedrooms !== undefined ? { bedrooms: dto.bedrooms } : {}),
  ...(dto.bathrooms !== undefined ? { bathrooms: dto.bathrooms } : {}),
  ...(dto.areaTotal !== undefined ? { areaTotal: dto.areaTotal } : {}),
  ...(dto.areaLiving !== undefined ? { areaLiving: dto.areaLiving } : {}),
  ...(dto.balconyArea !== undefined ? { balconyArea: dto.balconyArea } : {}),
  ...(dto.price !== undefined ? { price: dto.price } : {}),
  ...(dto.priceVisibility !== undefined
    ? { priceVisibility: dto.priceVisibility as PriceVisibility }
    : {}),
  ...(dto.description !== undefined ? { description: dto.description } : {}),
  ...(dto.matterportUrl !== undefined
    ? { matterportUrl: dto.matterportUrl }
    : {}),
  ...(dto.external3dUrl !== undefined
    ? { external3dUrl: dto.external3dUrl }
    : {}),
  ...(dto.orientation !== undefined ? { orientation: dto.orientation } : {}),
  ...(dto.viewType !== undefined ? { viewType: dto.viewType } : {}),
  ...(dto.features !== undefined
    ? { features: dto.features as Prisma.InputJsonValue }
    : {}),
  ...(dto.planMediaId !== undefined ? { planMediaId: dto.planMediaId } : {}),
  ...(dto.salesStatus !== undefined
    ? { salesStatus: dto.salesStatus as ApartmentSalesStatus }
    : {}),
  ...(salesStatusChanged
    ? {
        lastStatusChangedAt: new Date(),
        lastStatusChangedByUserId: userId,
        crmStatusSource: CrmStatusSource.manual,
      }
    : {}),
  updatedByUserId: userId,
});
