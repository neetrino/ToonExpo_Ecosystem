import { EXHIBITION_EVENT_STATUSES } from '@toonexpo/domain';
import { z } from 'zod';

export const EXHIBITION_EVENT_NAME_MAX_LENGTH = 160;
export const EXHIBITION_EVENT_CODE_MAX_LENGTH = 64;

const emptyToUndefined = (value: unknown): unknown => {
  if (value === '' || value === null) {
    return undefined;
  }
  return value;
};

const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date().optional());

export const exhibitionEventUpsertInputSchema = z.object({
  eventId: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).max(EXHIBITION_EVENT_NAME_MAX_LENGTH),
  code: z
    .string()
    .trim()
    .min(1)
    .max(EXHIBITION_EVENT_CODE_MAX_LENGTH)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, 'invalidCode'),
  startDate: optionalDate,
  endDate: optionalDate,
  status: z.enum(EXHIBITION_EVENT_STATUSES),
});

export type ExhibitionEventUpsertInput = z.infer<typeof exhibitionEventUpsertInputSchema>;

export const checkInInputSchema = z.object({
  qrToken: z.string().trim().min(1).max(256),
  eventId: z.string().trim().min(1).optional(),
});

export type CheckInInput = z.infer<typeof checkInInputSchema>;
