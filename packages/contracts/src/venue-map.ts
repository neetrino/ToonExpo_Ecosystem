import { emptyToUndefined } from '@toonexpo/shared';
import { z } from 'zod';

import { httpUrlSchemaWithMax } from './url';
import { HOTSPOT_COORD_MAX, HOTSPOT_COORD_MIN } from './visual-map';

/** Same 0–100 percent space as visual-map hotspots. */
export const BOOTH_COORD_MIN = HOTSPOT_COORD_MIN;
export const BOOTH_COORD_MAX = HOTSPOT_COORD_MAX;

export const VENUE_IMAGE_URL_MAX_LENGTH = 2048;
export const VENUE_IMAGE_ALT_MAX_LENGTH = 200;
export const BOOTH_CODE_MAX_LENGTH = 32;
export const BOOTH_LABEL_MAX_LENGTH = 80;
export const BOOTH_NOTE_MAX_LENGTH = 500;

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, z.string().max(maxLength).optional());

const requiredCoord = z.preprocess(
  emptyToUndefined,
  z.coerce.number().min(BOOTH_COORD_MIN).max(BOOTH_COORD_MAX),
);

const optionalId = z.preprocess(emptyToUndefined, z.string().trim().min(1).optional());

export const venueMapUpsertInputSchema = z.object({
  eventId: z.string().trim().min(1),
  imageUrl: httpUrlSchemaWithMax(VENUE_IMAGE_URL_MAX_LENGTH),
  imageAlt: optionalTrimmedString(VENUE_IMAGE_ALT_MAX_LENGTH),
});

export type VenueMapUpsertInput = z.infer<typeof venueMapUpsertInputSchema>;

export const boothUpsertInputSchema = z.object({
  boothId: optionalId,
  venueMapId: z.string().trim().min(1),
  code: z
    .string()
    .trim()
    .min(1)
    .max(BOOTH_CODE_MAX_LENGTH)
    .regex(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/, 'invalidBoothCode'),
  label: z.string().trim().min(1).max(BOOTH_LABEL_MAX_LENGTH),
  xPercent: requiredCoord,
  yPercent: requiredCoord,
  companyId: optionalId,
  partnerId: optionalId,
  note: optionalTrimmedString(BOOTH_NOTE_MAX_LENGTH),
  sortOrder: z.preprocess(emptyToUndefined, z.coerce.number().int().min(0).max(9999).optional()),
});

export type BoothUpsertInput = z.infer<typeof boothUpsertInputSchema>;

export const boothMoveInputSchema = z.object({
  boothId: z.string().trim().min(1),
  xPercent: requiredCoord,
  yPercent: requiredCoord,
});

export type BoothMoveInput = z.infer<typeof boothMoveInputSchema>;

export const boothIdInputSchema = z.object({
  boothId: z.string().trim().min(1),
});

export type BoothIdInput = z.infer<typeof boothIdInputSchema>;
