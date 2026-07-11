import type { PartnerType } from '@toonexpo/domain';
import { PARTNER_TYPES } from '@toonexpo/domain';
import { z } from 'zod';

const partnerTypeFilterSchema = z.enum(PARTNER_TYPES);

/** Parses an optional public partner list type filter; invalid values are ignored. */
export function parsePartnerTypeFilter(value: string | undefined): PartnerType | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = partnerTypeFilterSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}
