import { VENUE_PATH_NODE_KINDS } from '@toonexpo/domain';
import { emptyToUndefined } from '@toonexpo/shared';
import { z } from 'zod';

import { httpUrlSchemaWithMax } from './url';
import { HOTSPOT_COORD_MAX, HOTSPOT_COORD_MIN } from './visual-map';

/** Same 0–100 percent space as visual-map hotspots. */
export const BOOTH_COORD_MIN = HOTSPOT_COORD_MIN;
export const BOOTH_COORD_MAX = HOTSPOT_COORD_MAX;

/** Max distance (percent units) to snap a booth to a nearest path node. */
export const VENUE_PATH_BOOTH_SNAP_EPSILON = 3;

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

const optionalCoord = z.preprocess(
  emptyToUndefined,
  z.coerce.number().min(BOOTH_COORD_MIN).max(BOOTH_COORD_MAX).optional(),
);

const optionalId = z.preprocess(emptyToUndefined, z.string().trim().min(1).optional());

export const venueMapUpsertInputSchema = z.object({
  eventId: z.string().trim().min(1),
  imageUrl: httpUrlSchemaWithMax(VENUE_IMAGE_URL_MAX_LENGTH),
  imageAlt: optionalTrimmedString(VENUE_IMAGE_ALT_MAX_LENGTH),
  entranceXPercent: optionalCoord,
  entranceYPercent: optionalCoord,
});

export type VenueMapUpsertInput = z.infer<typeof venueMapUpsertInputSchema>;

export const venueEntranceInputSchema = z
  .object({
    venueMapId: z.string().trim().min(1),
    entranceXPercent: requiredCoord,
    entranceYPercent: requiredCoord,
  })
  .strict();

export type VenueEntranceInput = z.infer<typeof venueEntranceInputSchema>;

export const venuePathNodeUpsertInputSchema = z
  .object({
    nodeId: optionalId,
    venueMapId: z.string().trim().min(1),
    xPercent: requiredCoord,
    yPercent: requiredCoord,
    kind: z.enum(VENUE_PATH_NODE_KINDS),
    boothId: optionalId,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.kind === 'BOOTH' && !value.boothId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'boothIdRequired', path: ['boothId'] });
    }
    if (value.kind !== 'BOOTH' && value.boothId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'boothIdNotAllowed',
        path: ['boothId'],
      });
    }
  });

export type VenuePathNodeUpsertInput = z.infer<typeof venuePathNodeUpsertInputSchema>;

export const venuePathNodeIdInputSchema = z
  .object({
    nodeId: z.string().trim().min(1),
  })
  .strict();

export type VenuePathNodeIdInput = z.infer<typeof venuePathNodeIdInputSchema>;

export const venuePathEdgeUpsertInputSchema = z
  .object({
    venueMapId: z.string().trim().min(1),
    fromNodeId: z.string().trim().min(1),
    toNodeId: z.string().trim().min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.fromNodeId === value.toNodeId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'selfEdge', path: ['toNodeId'] });
    }
  });

export type VenuePathEdgeUpsertInput = z.infer<typeof venuePathEdgeUpsertInputSchema>;

export const venuePathEdgeIdInputSchema = z
  .object({
    edgeId: z.string().trim().min(1),
  })
  .strict();

export type VenuePathEdgeIdInput = z.infer<typeof venuePathEdgeIdInputSchema>;

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
