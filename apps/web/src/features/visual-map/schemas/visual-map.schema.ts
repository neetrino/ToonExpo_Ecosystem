import { z } from "zod";

import {
  VISUAL_HOTSPOT_TARGET_TYPES,
  VISUAL_MAP_CONTEXT_TYPES,
  VISUAL_MAP_PUBLICATION_STATUSES,
} from "@/features/visual-map/constants";

export const visualCanvasFormSchema = z.object({
  contextType: z.enum(VISUAL_MAP_CONTEXT_TYPES),
  contextId: z.string().trim().min(1),
  mediaAssetId: z.string().trim().min(1).max(500),
  title: z.string().trim().max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  isPrimary: z.boolean().optional(),
});

export type VisualCanvasFormInput = z.input<typeof visualCanvasFormSchema>;
export type VisualCanvasFormValues = z.output<typeof visualCanvasFormSchema>;

export const visualHotspotFormSchema = z.object({
  targetType: z.enum(VISUAL_HOTSPOT_TARGET_TYPES),
  targetId: z.string().trim().min(1),
  label: z.string().trim().min(1).max(200),
  xPercent: z.coerce.number().min(0).max(100),
  yPercent: z.coerce.number().min(0).max(100),
  markerStyle: z.string().trim().max(64).optional(),
  publicationStatus: z.enum(VISUAL_MAP_PUBLICATION_STATUSES).optional(),
});

export type VisualHotspotFormInput = z.input<typeof visualHotspotFormSchema>;
export type VisualHotspotFormValues = z.output<typeof visualHotspotFormSchema>;
