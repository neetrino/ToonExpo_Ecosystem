import { APARTMENT_STATUSES } from '@toonexpo/domain';
import { z } from 'zod';

export const publicMediaAssetSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  alt: z.string().nullable(),
});

export type PublicMediaAsset = z.infer<typeof publicMediaAssetSchema>;

export const publicApartmentSchema = z.object({
  id: z.string(),
  code: z.string(),
  status: z.enum(APARTMENT_STATUSES),
  areaSqm: z.number().nullable(),
  rooms: z.number().int().nullable(),
  priceAmd: z.number().int().nullable(),
});

export type PublicApartment = z.infer<typeof publicApartmentSchema>;

export const publicFloorSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number().int(),
  apartments: z.array(publicApartmentSchema),
});

export type PublicFloor = z.infer<typeof publicFloorSchema>;

export const publicBuildingSchema = z.object({
  id: z.string(),
  name: z.string(),
  floors: z.array(publicFloorSchema),
});

export type PublicBuilding = z.infer<typeof publicBuildingSchema>;

export const publicProjectSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  companySlug: z.string(),
  companyName: z.string(),
  name: z.string(),
  city: z.string().nullable(),
  coverImageUrl: z.string().url().nullable(),
});

export type PublicProjectSummary = z.infer<typeof publicProjectSummarySchema>;

export const publicProjectDetailSchema = publicProjectSummarySchema.extend({
  description: z.string().nullable(),
  address: z.string().nullable(),
  media: z.array(publicMediaAssetSchema),
  buildings: z.array(publicBuildingSchema),
});

export type PublicProjectDetail = z.infer<typeof publicProjectDetailSchema>;
