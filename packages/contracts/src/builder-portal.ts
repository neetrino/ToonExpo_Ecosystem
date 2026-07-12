import { APARTMENT_STATUSES, PRICE_VISIBILITIES, PUBLICATION_STATUSES } from '@toonexpo/domain';
import { z } from 'zod';

import { httpUrlSchema, optionalHttpUrlSchema } from './url';

export const PROJECT_NAME_MAX_LENGTH = 120;
export const PROJECT_CITY_ADDRESS_MAX_LENGTH = 160;
export const PROJECT_DESCRIPTION_MAX_LENGTH = 4000;

export const BUILDING_NAME_MAX_LENGTH = 120;
export const BUILDING_DESCRIPTION_MAX_LENGTH = 4000;

export const FLOOR_NAME_MAX_LENGTH = 60;
export const FLOOR_LEVEL_MIN = -5;
export const FLOOR_LEVEL_MAX = 100;

export const APARTMENT_CODE_MAX_LENGTH = 20;
export const APARTMENT_ROOMS_MAX = 20;
export const APARTMENT_AREA_SQM_MAX = 10_000;
export const APARTMENT_PRICE_AMD_MAX = 10_000_000_000;
export const APARTMENT_MATTERPORT_URL_MAX_LENGTH = 2048;

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, z.string().max(maxLength).optional());

const emptyToUndefined = (value: unknown): unknown => {
  if (value === '' || value === null) {
    return undefined;
  }
  return value;
};

const requiredCoercedInt = (min: number, max: number) =>
  z.preprocess(emptyToUndefined, z.coerce.number().int().min(min).max(max));

const optionalCoercedInt = (min: number, max: number) =>
  z.preprocess(emptyToUndefined, z.coerce.number().int().min(min).max(max).optional());

const optionalCoercedPositiveNumber = (max: number) =>
  z.preprocess(emptyToUndefined, z.coerce.number().positive().max(max).optional());

const optionalCoercedPositiveInt = (max: number) =>
  z.preprocess(emptyToUndefined, z.coerce.number().int().positive().max(max).optional());

export const projectUpsertInputSchema = z.object({
  projectId: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).max(PROJECT_NAME_MAX_LENGTH),
  city: optionalTrimmedString(PROJECT_CITY_ADDRESS_MAX_LENGTH),
  address: optionalTrimmedString(PROJECT_CITY_ADDRESS_MAX_LENGTH),
  description: optionalTrimmedString(PROJECT_DESCRIPTION_MAX_LENGTH),
});

export type ProjectUpsertInput = z.infer<typeof projectUpsertInputSchema>;

export const buildingCreateInputSchema = z.object({
  projectId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(BUILDING_NAME_MAX_LENGTH),
});

export type BuildingCreateInput = z.infer<typeof buildingCreateInputSchema>;

export const buildingUpdateInputSchema = z.object({
  buildingId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(BUILDING_NAME_MAX_LENGTH),
  description: optionalTrimmedString(BUILDING_DESCRIPTION_MAX_LENGTH),
});

export type BuildingUpdateInput = z.infer<typeof buildingUpdateInputSchema>;

export const buildingPublicationInputSchema = z.object({
  buildingId: z.string().trim().min(1),
  status: z.enum(PUBLICATION_STATUSES),
});

export type BuildingPublicationInput = z.infer<typeof buildingPublicationInputSchema>;

export const floorPublicationInputSchema = z.object({
  floorId: z.string().trim().min(1),
  status: z.enum(PUBLICATION_STATUSES),
});

export type FloorPublicationInput = z.infer<typeof floorPublicationInputSchema>;

export const floorCreateInputSchema = z.object({
  buildingId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(FLOOR_NAME_MAX_LENGTH),
  level: requiredCoercedInt(FLOOR_LEVEL_MIN, FLOOR_LEVEL_MAX),
});

export type FloorCreateInput = z.infer<typeof floorCreateInputSchema>;

export const floorUpdateInputSchema = z.object({
  floorId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(FLOOR_NAME_MAX_LENGTH),
  level: requiredCoercedInt(FLOOR_LEVEL_MIN, FLOOR_LEVEL_MAX),
});

export type FloorUpdateInput = z.infer<typeof floorUpdateInputSchema>;

export const apartmentUpsertInputSchema = z.object({
  apartmentId: z.string().trim().min(1).optional(),
  floorId: z.string().trim().min(1),
  code: z.string().trim().min(1).max(APARTMENT_CODE_MAX_LENGTH),
  rooms: optionalCoercedInt(0, APARTMENT_ROOMS_MAX),
  areaSqm: optionalCoercedPositiveNumber(APARTMENT_AREA_SQM_MAX),
  priceAmd: optionalCoercedPositiveInt(APARTMENT_PRICE_AMD_MAX),
  priceVisibility: z.enum(PRICE_VISIBILITIES).default('PUBLIC'),
  matterportUrl: optionalHttpUrlSchema(APARTMENT_MATTERPORT_URL_MAX_LENGTH),
  status: z.enum(APARTMENT_STATUSES),
});

export type ApartmentUpsertInput = z.infer<typeof apartmentUpsertInputSchema>;

export const projectPublicationInputSchema = z.object({
  projectId: z.string().trim().min(1),
  status: z.enum(PUBLICATION_STATUSES),
});

export type ProjectPublicationInput = z.infer<typeof projectPublicationInputSchema>;

export const MEDIA_ALT_MAX_LENGTH = 160;
export const MEDIA_SORT_ORDER_MIN = 0;
export const MEDIA_SORT_ORDER_MAX = 999;

const mediaOwnerXorRefine = (
  data: { projectId?: string; apartmentId?: string },
  ctx: z.RefinementCtx,
): void => {
  const hasProject = Boolean(data.projectId);
  const hasApartment = Boolean(data.apartmentId);
  if (hasProject === hasApartment) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Exactly one of projectId or apartmentId is required',
    });
  }
};

export const mediaAssetUpsertInputSchema = z
  .object({
    mediaAssetId: z.string().trim().min(1).optional(),
    projectId: z.string().trim().min(1).optional(),
    apartmentId: z.string().trim().min(1).optional(),
    url: httpUrlSchema,
    alt: optionalTrimmedString(MEDIA_ALT_MAX_LENGTH),
    sortOrder: z.coerce
      .number()
      .int()
      .min(MEDIA_SORT_ORDER_MIN)
      .max(MEDIA_SORT_ORDER_MAX)
      .default(MEDIA_SORT_ORDER_MIN),
  })
  .superRefine(mediaOwnerXorRefine);

export type MediaAssetUpsertInput = z.infer<typeof mediaAssetUpsertInputSchema>;

export const mediaAssetIdInputSchema = z.object({
  mediaAssetId: z.string().trim().min(1),
});

export type MediaAssetIdInput = z.infer<typeof mediaAssetIdInputSchema>;
