import { z } from "zod";

import {
  EXHIBITION_EVENT_STATUSES,
  EXHIBITION_PUBLICATION_STATUSES,
} from "@/features/exhibition/constants";

export const eventFormSchema = z.object({
  name: z.string().trim().min(1).max(200),
  code: z.string().trim().min(1).max(64),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(EXHIBITION_EVENT_STATUSES),
  publicationStatus: z.enum(EXHIBITION_PUBLICATION_STATUSES),
});

export type EventFormInput = z.input<typeof eventFormSchema>;
export type EventFormValues = z.output<typeof eventFormSchema>;

export const venueMapFormSchema = z.object({
  title: z.string().trim().min(1).max(200),
  mediaAssetId: z.string().trim().min(1).max(500),
  publicationStatus: z.enum(EXHIBITION_PUBLICATION_STATUSES),
  width: z.coerce.number().int().positive().optional().or(z.literal("")),
  height: z.coerce.number().int().positive().optional().or(z.literal("")),
});

export type VenueMapFormInput = z.input<typeof venueMapFormSchema>;
export type VenueMapFormValues = z.output<typeof venueMapFormSchema>;

export const boothFormSchema = z.object({
  code: z.string().trim().min(1).max(32),
  name: z.string().trim().max(200).optional(),
  type: z.enum([
    "builder",
    "bank",
    "partner",
    "sponsor",
    "service",
    "info",
    "entrance",
    "other",
  ]),
  xPercent: z.coerce.number().min(0).max(100),
  yPercent: z.coerce.number().min(0).max(100),
  locationText: z.string().trim().max(500).optional(),
  publicationStatus: z.enum(EXHIBITION_PUBLICATION_STATUSES),
});

export type BoothFormInput = z.input<typeof boothFormSchema>;
export type BoothFormValues = z.output<typeof boothFormSchema>;

export const boothAssignmentFormSchema = z.object({
  companyId: z.string().optional(),
  projectId: z.string().optional(),
  assignmentLabel: z.string().trim().max(200).optional(),
  active: z.boolean(),
});

export type BoothAssignmentFormInput = z.input<typeof boothAssignmentFormSchema>;
export type BoothAssignmentFormValues = z.output<typeof boothAssignmentFormSchema>;
