import {
  BOS_COMPANY_TYPES,
  BOS_PROVISIONING_STATUSES,
  BOS_REQUESTED_MODULES,
  PARTNER_TYPES,
} from '@toonexpo/domain';
import { z } from 'zod';

/** Max lengths for BOS provisioning payload fields (v1). */
export const BOS_REQUEST_ID_MAX_LENGTH = 128;
export const BOS_COMPANY_ID_MAX_LENGTH = 128;
export const BOS_COMPANY_NAME_MAX_LENGTH = 160;
export const BOS_CONTACT_NAME_MAX_LENGTH = 120;
export const BOS_CONTACT_EMAIL_MAX_LENGTH = 254;
export const BOS_CONTACT_PHONE_MAX_LENGTH = 40;
export const BOS_EVENT_CYCLE_ID_MAX_LENGTH = 128;
export const BOS_EVENT_CYCLE_NAME_MAX_LENGTH = 160;

/**
 * Machine-readable error codes for the BOS provisioning HTTP API.
 * Docs: 15-Integrations/02 + 05; HTTP mapping is API-local.
 */
export const BOS_ERROR_CODES = [
  'VALIDATION_ERROR',
  'EMAIL_CONFLICT',
  'UNAUTHORIZED',
  'INTEGRATION_DISABLED',
  'PROVISIONING_FAILED',
] as const;

export type BosErrorCode = (typeof BOS_ERROR_CODES)[number];

/**
 * Inbound Create ToonExpo Account Request (camelCase JSON).
 * Field mapping from docs snake_case:
 * request_id, bos_company_id, company_name, company_type, primary_contact_*,
 * event_cycle_*, requested_modules (+ partnerType when partner).
 * Docs: 15-Integrations/02-BOS-Account-Provisioning.
 */
export const bosProvisioningRequestSchema = z
  .object({
    requestId: z.string().trim().min(1).max(BOS_REQUEST_ID_MAX_LENGTH),
    bosCompanyId: z.string().trim().min(1).max(BOS_COMPANY_ID_MAX_LENGTH),
    companyName: z.string().trim().min(1).max(BOS_COMPANY_NAME_MAX_LENGTH),
    companyType: z.enum(BOS_COMPANY_TYPES),
    primaryContactName: z.string().trim().min(1).max(BOS_CONTACT_NAME_MAX_LENGTH),
    primaryContactEmail: z.string().trim().email().max(BOS_CONTACT_EMAIL_MAX_LENGTH),
    primaryContactPhone: z.string().trim().min(1).max(BOS_CONTACT_PHONE_MAX_LENGTH).optional(),
    eventCycleId: z.string().trim().min(1).max(BOS_EVENT_CYCLE_ID_MAX_LENGTH).optional(),
    eventCycleName: z.string().trim().min(1).max(BOS_EVENT_CYCLE_NAME_MAX_LENGTH).optional(),
    requestedModules: z.array(z.enum(BOS_REQUESTED_MODULES)).default([]),
    /** Required when companyType is partner; bank defaults to BANK. */
    partnerType: z.enum(PARTNER_TYPES).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.companyType === 'partner' && !data.partnerType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['partnerType'],
        message: 'partnerType is required when companyType is partner',
      });
    }
  });

export type BosProvisioningRequest = z.infer<typeof bosProvisioningRequestSchema>;

/** Account Creation Result returned to BOS (v1). Docs: 02 + Integration Contracts. */
export const bosProvisioningResponseSchema = z.object({
  requestId: z.string(),
  toonexpoCompanyId: z.string().nullable(),
  primaryUserId: z.string().nullable(),
  status: z.enum(BOS_PROVISIONING_STATUSES),
  errorMessage: z.string().optional(),
  createdAt: z.string().datetime(),
  /** True when this response was replayed from the idempotency store. */
  idempotent: z.boolean().optional(),
});

export type BosProvisioningResponse = z.infer<typeof bosProvisioningResponseSchema>;

export const bosErrorResponseSchema = z.object({
  code: z.enum(BOS_ERROR_CODES),
  message: z.string(),
  issues: z
    .array(
      z.object({
        path: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
});

export type BosErrorResponse = z.infer<typeof bosErrorResponseSchema>;
