import { z } from "zod";

import {
  VISUAL_HOTSPOT_TARGET_TYPES,
  VISUAL_MAP_PUBLICATION_STATUSES,
} from "@/features/visual-map/constants";

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
