import { APARTMENT_STATUSES, PUBLICATION_STATUSES } from '@toonexpo/domain';
import { z } from 'zod';

export const PROJECT_NAME_MAX_LENGTH = 120;
export const PROJECT_CITY_ADDRESS_MAX_LENGTH = 160;
export const PROJECT_DESCRIPTION_MAX_LENGTH = 4000;

export const BUILDING_NAME_MAX_LENGTH = 120;

export const FLOOR_NAME_MAX_LENGTH = 60;
export const FLOOR_LEVEL_MIN = -5;
export const FLOOR_LEVEL_MAX = 100;

export const APARTMENT_CODE_MAX_LENGTH = 20;
export const APARTMENT_ROOMS_MAX = 20;
export const APARTMENT_AREA_SQM_MAX = 10_000;
export const APARTMENT_PRICE_AMD_MAX = 10_000_000_000;

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, z.string().max(maxLength).optional());

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
});

export type BuildingUpdateInput = z.infer<typeof buildingUpdateInputSchema>;

export const floorCreateInputSchema = z.object({
  buildingId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(FLOOR_NAME_MAX_LENGTH),
  level: z.coerce.number().int().min(FLOOR_LEVEL_MIN).max(FLOOR_LEVEL_MAX),
});

export type FloorCreateInput = z.infer<typeof floorCreateInputSchema>;

export const floorUpdateInputSchema = z.object({
  floorId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(FLOOR_NAME_MAX_LENGTH),
  level: z.coerce.number().int().min(FLOOR_LEVEL_MIN).max(FLOOR_LEVEL_MAX),
});

export type FloorUpdateInput = z.infer<typeof floorUpdateInputSchema>;

export const apartmentUpsertInputSchema = z.object({
  apartmentId: z.string().trim().min(1).optional(),
  floorId: z.string().trim().min(1),
  code: z.string().trim().min(1).max(APARTMENT_CODE_MAX_LENGTH),
  rooms: z.coerce.number().int().min(0).max(APARTMENT_ROOMS_MAX).optional(),
  areaSqm: z.coerce.number().positive().max(APARTMENT_AREA_SQM_MAX).optional(),
  priceAmd: z.coerce.number().int().positive().max(APARTMENT_PRICE_AMD_MAX).optional(),
  status: z.enum(APARTMENT_STATUSES),
});

export type ApartmentUpsertInput = z.infer<typeof apartmentUpsertInputSchema>;

export const projectPublicationInputSchema = z.object({
  projectId: z.string().trim().min(1),
  status: z.enum(PUBLICATION_STATUSES),
});

export type ProjectPublicationInput = z.infer<typeof projectPublicationInputSchema>;
