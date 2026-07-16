import type { PublicationStatus } from '@toonexpo/domain';
import { PUBLICATION_STATUSES } from '@toonexpo/domain';
import { z } from 'zod';

const projectStatusFilterSchema = z.enum(PUBLICATION_STATUSES);

export function parseProjectStatusFilter(value: string | undefined): PublicationStatus | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = projectStatusFilterSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}
