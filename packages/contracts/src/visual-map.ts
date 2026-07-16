import { APARTMENT_STATUSES, PUBLICATION_STATUSES } from '@toonexpo/domain';
import { emptyToUndefined } from '@toonexpo/shared';
import { z } from 'zod';

import { httpUrlSchemaWithMax } from './url';

export const CANVAS_TITLE_MAX_LENGTH = 120;
export const CANVAS_IMAGE_URL_MAX_LENGTH = 2048;
export const CANVAS_IMAGE_ALT_MAX_LENGTH = 200;

export const HOTSPOT_COORD_MIN = 0;
export const HOTSPOT_COORD_MAX = 100;
export const HOTSPOT_LABEL_MAX_LENGTH = 80;

export const VISUAL_MAP_CONTEXT_TYPES = ['project', 'building', 'floor'] as const;
export type VisualMapContextType = (typeof VISUAL_MAP_CONTEXT_TYPES)[number];

export const VISUAL_MAP_TARGET_TYPES = ['building', 'floor', 'apartment'] as const;
export type VisualMapTargetType = (typeof VISUAL_MAP_TARGET_TYPES)[number];

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
  z.coerce.number().min(HOTSPOT_COORD_MIN).max(HOTSPOT_COORD_MAX),
);

const optionalId = z.preprocess(emptyToUndefined, z.string().trim().min(1).optional());

function countDefined(values: ReadonlyArray<string | undefined>): number {
  return values.filter((value) => value != null && value.length > 0).length;
}

export const canvasUpsertInputSchema = z
  .object({
    canvasId: optionalId,
    projectId: optionalId,
    buildingId: optionalId,
    floorId: optionalId,
    title: optionalTrimmedString(CANVAS_TITLE_MAX_LENGTH),
    // v1 URL input; replace with media-upload pipeline when available.
    imageUrl: httpUrlSchemaWithMax(CANVAS_IMAGE_URL_MAX_LENGTH),
    imageAlt: optionalTrimmedString(CANVAS_IMAGE_ALT_MAX_LENGTH),
  })
  .superRefine((data, ctx) => {
    if (data.canvasId) {
      return;
    }
    if (countDefined([data.projectId, data.buildingId, data.floorId]) !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'exactlyOneContext',
        path: ['projectId'],
      });
    }
  });

export type CanvasUpsertInput = z.infer<typeof canvasUpsertInputSchema>;

export const canvasStatusInputSchema = z.object({
  canvasId: z.string().trim().min(1),
  status: z.enum(PUBLICATION_STATUSES),
});

export type CanvasStatusInput = z.infer<typeof canvasStatusInputSchema>;

export const canvasIdInputSchema = z.object({
  canvasId: z.string().trim().min(1),
});

export type CanvasIdInput = z.infer<typeof canvasIdInputSchema>;

export const hotspotUpsertInputSchema = z
  .object({
    hotspotId: optionalId,
    canvasId: z.string().trim().min(1),
    x: requiredCoord,
    y: requiredCoord,
    label: optionalTrimmedString(HOTSPOT_LABEL_MAX_LENGTH),
    buildingId: optionalId,
    floorId: optionalId,
    apartmentId: optionalId,
  })
  .superRefine((data, ctx) => {
    if (countDefined([data.buildingId, data.floorId, data.apartmentId]) !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'exactlyOneTarget',
        path: ['buildingId'],
      });
    }
  });

export type HotspotUpsertInput = z.infer<typeof hotspotUpsertInputSchema>;

export const hotspotMoveInputSchema = z.object({
  hotspotId: z.string().trim().min(1),
  x: requiredCoord,
  y: requiredCoord,
});

export type HotspotMoveInput = z.infer<typeof hotspotMoveInputSchema>;

export const hotspotIdInputSchema = z.object({
  hotspotId: z.string().trim().min(1),
});

export type HotspotIdInput = z.infer<typeof hotspotIdInputSchema>;

const publicBuildingTargetSchema = z.object({
  type: z.literal('building'),
  buildingId: z.string(),
  name: z.string(),
});

const publicFloorTargetSchema = z.object({
  type: z.literal('floor'),
  floorId: z.string(),
  buildingId: z.string(),
  name: z.string(),
  level: z.number().int(),
});

const publicApartmentTargetSchema = z.object({
  type: z.literal('apartment'),
  apartmentId: z.string(),
  floorId: z.string(),
  buildingId: z.string(),
  code: z.string(),
  status: z.enum(APARTMENT_STATUSES),
});

export const publicHotspotTargetSchema = z.discriminatedUnion('type', [
  publicBuildingTargetSchema,
  publicFloorTargetSchema,
  publicApartmentTargetSchema,
]);

export type PublicHotspotTarget = z.infer<typeof publicHotspotTargetSchema>;

export const publicHotspotSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  label: z.string().nullable(),
  target: publicHotspotTargetSchema,
});

export type PublicHotspot = z.infer<typeof publicHotspotSchema>;

export const publicCanvasSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  imageUrl: z.string().url(),
  imageAlt: z.string().nullable(),
  contextType: z.enum(VISUAL_MAP_CONTEXT_TYPES),
  projectId: z.string(),
  buildingId: z.string().nullable(),
  floorId: z.string().nullable(),
  companySlug: z.string(),
  projectSlug: z.string(),
  hotspots: z.array(publicHotspotSchema),
});

export type PublicCanvas = z.infer<typeof publicCanvasSchema>;
