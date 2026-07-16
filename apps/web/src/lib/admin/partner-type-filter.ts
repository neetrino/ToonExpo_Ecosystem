import type { PartnerType, PublicationStatus } from '@toonexpo/domain';
import { PARTNER_TYPES } from '@toonexpo/domain';
import { z } from 'zod';

const partnerTypeFilterSchema = z.enum(PARTNER_TYPES);

export function parsePartnerTypeFilter(value: string | undefined): PartnerType | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = partnerTypeFilterSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export function parsePartnerStatusFilter(value: string | undefined): PublicationStatus | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const).safeParse(value);
  return parsed.success ? parsed.data : undefined;
}
