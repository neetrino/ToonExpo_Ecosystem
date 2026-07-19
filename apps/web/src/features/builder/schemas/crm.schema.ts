import { z } from "zod";
import type { CrmActivityType, CrmDealStatus, RequestSource } from "@toonexpo/contracts";

import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  PHONE_MIN_LENGTH,
  PHONE_PATTERN,
} from "@/shared/config/auth.constants";

export const CRM_NOTE_MAX_LENGTH = 4000;
export const CRM_ACTIVITY_TITLE_MAX_LENGTH = 200;
export const CRM_LOST_REASON_MAX_LENGTH = 500;
export const CRM_CONTACT_NAME_MAX_LENGTH = 200;

export const CRM_DEAL_STATUSES = [
  "new_request",
  "assigned",
  "contacted",
  "follow_up_needed",
  "apartment_selected",
  "reserved",
  "converted",
  "closed",
  "lost",
] as const satisfies readonly CrmDealStatus[];

export const CRM_REQUEST_SOURCES = [
  "buyer_project_request",
  "builder_buyer_qr_scan",
  "manual_builder_entry",
  "event_interaction",
] as const satisfies readonly RequestSource[];

export const CRM_ACTIVITY_TYPES = [
  "call",
  "email",
  "meeting",
  "send_offer",
  "follow_up",
  "status_update",
  "other",
] as const satisfies readonly CrmActivityType[];

/**
 * Manual CRM deal create form.
 */
export const createManualDealSchema = z.object({
  contactName: z
    .string()
    .trim()
    .min(1)
    .max(CRM_CONTACT_NAME_MAX_LENGTH),
  contactPhone: z
    .string()
    .trim()
    .refine(
      (value) =>
        value.length === 0 ||
        (value.length >= PHONE_MIN_LENGTH &&
          value.length <= PHONE_MAX_LENGTH &&
          PHONE_PATTERN.test(value)),
      { message: "phone" },
    ),
  contactEmail: z
    .string()
    .trim()
    .refine(
      (value) =>
        value.length === 0 ||
        (value.includes("@") && value.length <= EMAIL_MAX_LENGTH),
      { message: "email" },
    ),
  projectId: z.string().trim().optional(),
  note: z.string().trim().max(CRM_NOTE_MAX_LENGTH).optional(),
});

export type CreateManualDealFormValues = z.infer<typeof createManualDealSchema>;

/**
 * Status change with optional lost reason.
 */
export const updateDealStatusSchema = z
  .object({
    status: z.enum(CRM_DEAL_STATUSES),
    lostReason: z.string().trim().max(CRM_LOST_REASON_MAX_LENGTH).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status === "lost" && !value.lostReason?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["lostReason"],
        message: "lostReason",
      });
    }
  });

export type UpdateDealStatusFormValues = z.infer<typeof updateDealStatusSchema>;

export const createNoteSchema = z.object({
  body: z.string().trim().min(1).max(CRM_NOTE_MAX_LENGTH),
});

export type CreateNoteFormValues = z.infer<typeof createNoteSchema>;

export const createActivitySchema = z.object({
  type: z.enum(CRM_ACTIVITY_TYPES),
  title: z.string().trim().min(1).max(CRM_ACTIVITY_TITLE_MAX_LENGTH),
  dueAt: z.string().trim().optional(),
});

export type CreateActivityFormValues = z.infer<typeof createActivitySchema>;

/** Re-export for forms that need a name length constant. */
export { NAME_MAX_LENGTH };
