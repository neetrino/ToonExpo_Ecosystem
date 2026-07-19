import { z } from "zod";

import {
  PORTAL_APARTMENT_NUMBER_MAX_LENGTH,
  PORTAL_BUILDING_NAME_MAX_LENGTH,
  PORTAL_BULK_APARTMENTS_MAX,
  PORTAL_DESCRIPTION_MAX_LENGTH,
} from "@/features/builder/constants";
import { optionalMediaIdField } from "@/features/media/schemas/media-fields.schema";

/**
 * Inline form schema for adding a building.
 */
export const createBuildingSchema = z.object({
  name: z.string().trim().min(1).max(PORTAL_BUILDING_NAME_MAX_LENGTH),
  description: z.string().trim().max(PORTAL_DESCRIPTION_MAX_LENGTH),
  coverMediaId: optionalMediaIdField,
});

export type CreateBuildingFormValues = z.infer<typeof createBuildingSchema>;

export const updateBuildingSchema = z.object({
  coverMediaId: optionalMediaIdField,
});

export type UpdateBuildingFormValues = z.infer<typeof updateBuildingSchema>;

/**
 * Inline form schema for adding a floor.
 */
export const createFloorSchema = z.object({
  floorNumber: z
    .string()
    .trim()
    .refine((value) => {
      const parsed = Number(value);
      return Number.isInteger(parsed) && parsed >= -5 && parsed <= 200;
    }),
  name: z.string().trim().max(PORTAL_BUILDING_NAME_MAX_LENGTH),
  displayLabel: z.string().trim().max(PORTAL_BUILDING_NAME_MAX_LENGTH),
  floorplanMediaId: optionalMediaIdField,
});

export type CreateFloorFormValues = z.infer<typeof createFloorSchema>;

export const updateFloorSchema = z.object({
  floorplanMediaId: optionalMediaIdField,
});

export type UpdateFloorFormValues = z.infer<typeof updateFloorSchema>;

/**
 * Bulk apartment creation template.
 */
export const bulkApartmentsSchema = z.object({
  count: z
    .string()
    .trim()
    .refine((value) => {
      const parsed = Number(value);
      return (
        Number.isInteger(parsed) &&
        parsed >= 1 &&
        parsed <= PORTAL_BULK_APARTMENTS_MAX
      );
    }),
  numberPrefix: z.string().trim().max(PORTAL_APARTMENT_NUMBER_MAX_LENGTH),
  startNumber: z
    .string()
    .trim()
    .refine((value) => {
      const parsed = Number(value);
      return Number.isInteger(parsed) && parsed >= 1 && parsed <= 9999;
    }),
  rooms: z.string().trim(),
  bedrooms: z.string().trim(),
  bathrooms: z.string().trim(),
  areaTotal: z.string().trim(),
  price: z.string().trim(),
});

export type BulkApartmentsFormValues = z.infer<typeof bulkApartmentsSchema>;
