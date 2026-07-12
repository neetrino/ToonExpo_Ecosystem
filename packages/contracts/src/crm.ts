import { ACTIVITY_STATUSES, DEAL_STAGES, REQUEST_SOURCES } from '@toonexpo/domain';
import { z } from 'zod';

export const CONTACT_NAME_MAX_LENGTH = 120;
export const CONTACT_PHONE_MIN_LENGTH = 5;
export const CONTACT_PHONE_MAX_LENGTH = 32;
export const CONTACT_EMAIL_MAX_LENGTH = 254;
export const DEAL_TITLE_MAX_LENGTH = 200;
export const DEAL_MESSAGE_MAX_LENGTH = 4000;
export const DEAL_ACTIVITY_BODY_MAX_LENGTH = 4000;

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, z.string().max(maxLength).optional());

const contactNameSchema = z.string().trim().min(1).max(CONTACT_NAME_MAX_LENGTH);
const contactPhoneSchema = z
  .string()
  .trim()
  .min(CONTACT_PHONE_MIN_LENGTH)
  .max(CONTACT_PHONE_MAX_LENGTH);
const contactEmailSchema = z.string().trim().email().max(CONTACT_EMAIL_MAX_LENGTH);

/** Public project/apartment page request intake (anonymous or registered). */
export const publicRequestInputSchema = z.object({
  projectId: z.string().trim().min(1),
  apartmentId: z.string().trim().min(1).optional(),
  name: contactNameSchema,
  phone: contactPhoneSchema,
  email: contactEmailSchema,
  message: optionalTrimmedString(DEAL_MESSAGE_MAX_LENGTH),
});

export type PublicRequestInput = z.infer<typeof publicRequestInputSchema>;

export const dealStageUpdateInputSchema = z.object({
  dealId: z.string().trim().min(1),
  stage: z.enum(DEAL_STAGES),
});

export type DealStageUpdateInput = z.infer<typeof dealStageUpdateInputSchema>;

/** Builder-authored activities only; STATUS_CHANGE is written by the system. */
export const BUILDER_DEAL_ACTIVITY_TYPES = ['COMMENT', 'FOLLOW_UP'] as const;

export const dealActivityInputSchema = z.object({
  dealId: z.string().trim().min(1),
  type: z.enum(BUILDER_DEAL_ACTIVITY_TYPES),
  body: z.string().trim().min(1).max(DEAL_ACTIVITY_BODY_MAX_LENGTH),
  nextFollowUpAt: z.coerce.date().optional(),
});

export type DealActivityInput = z.infer<typeof dealActivityInputSchema>;

export const activityStatusUpdateInputSchema = z.object({
  activityId: z.string().trim().min(1),
  status: z.enum(ACTIVITY_STATUSES),
});

export type ActivityStatusUpdateInput = z.infer<typeof activityStatusUpdateInputSchema>;

export const dealApartmentLinkInputSchema = z.object({
  dealId: z.string().trim().min(1),
  apartmentId: z.string().trim().min(1),
});

export type DealApartmentLinkInput = z.infer<typeof dealApartmentLinkInputSchema>;

export const dealAssignInputSchema = z.object({
  dealId: z.string().trim().min(1),
  assigneeUserId: z.string().trim().min(1).nullable(),
});

export type DealAssignInput = z.infer<typeof dealAssignInputSchema>;

const optionalContactEmailSchema = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().email().max(CONTACT_EMAIL_MAX_LENGTH).optional());

/** Builder-created deal (manual entry). */
export const manualDealInputSchema = z.object({
  companyId: z.string().trim().min(1),
  source: z.enum(REQUEST_SOURCES).default('MANUAL_BUILDER_ENTRY'),
  contactName: contactNameSchema,
  contactPhone: contactPhoneSchema,
  contactEmail: optionalContactEmailSchema,
  title: optionalTrimmedString(DEAL_TITLE_MAX_LENGTH),
  message: optionalTrimmedString(DEAL_MESSAGE_MAX_LENGTH),
  projectId: z.string().trim().min(1).optional(),
  apartmentId: z.string().trim().min(1).optional(),
  assignedUserId: z.string().trim().min(1).optional(),
  buyerUserId: z.string().trim().min(1).optional(),
});

export type ManualDealInput = z.infer<typeof manualDealInputSchema>;

/** Builder creates a CRM deal after scanning a buyer QR. */
export const builderQrScanDealInputSchema = z.object({
  qrToken: z.string().trim().min(1).max(128),
  projectId: z.string().trim().min(1).optional(),
  note: optionalTrimmedString(DEAL_MESSAGE_MAX_LENGTH),
});

export type BuilderQrScanDealInput = z.infer<typeof builderQrScanDealInputSchema>;
