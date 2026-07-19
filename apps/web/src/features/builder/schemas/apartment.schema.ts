import { z } from "zod";

import {
  APARTMENT_SALES_STATUSES,
  PORTAL_APARTMENT_NUMBER_MAX_LENGTH,
  PORTAL_DESCRIPTION_MAX_LENGTH,
  PORTAL_STATUS_REASON_MAX_LENGTH,
  PRICE_VISIBILITY_OPTIONS,
} from "@/features/builder/constants";
import {
  optionalHttpsUrlField,
  optionalMediaIdField,
} from "@/features/media/schemas/media-fields.schema";

/**
 * Client schema for editing a portal apartment.
 */
export const updateApartmentSchema = z.object({
  number: z.string().trim().min(1).max(PORTAL_APARTMENT_NUMBER_MAX_LENGTH),
  rooms: z.string().trim(),
  bedrooms: z.string().trim(),
  bathrooms: z.string().trim(),
  areaTotal: z.string().trim(),
  areaLiving: z.string().trim(),
  balconyArea: z.string().trim(),
  price: z.string().trim(),
  priceVisibility: z.enum(PRICE_VISIBILITY_OPTIONS),
  salesStatus: z.enum(APARTMENT_SALES_STATUSES),
  statusChangeReason: z
    .string()
    .trim()
    .max(PORTAL_STATUS_REASON_MAX_LENGTH),
  descriptionHy: z.string().trim().max(PORTAL_DESCRIPTION_MAX_LENGTH),
  descriptionRu: z.string().trim().max(PORTAL_DESCRIPTION_MAX_LENGTH),
  descriptionEn: z.string().trim().max(PORTAL_DESCRIPTION_MAX_LENGTH),
  planMediaId: optionalMediaIdField,
  matterportUrl: optionalHttpsUrlField,
  external3dUrl: optionalHttpsUrlField,
});

export type UpdateApartmentFormValues = z.infer<typeof updateApartmentSchema>;
