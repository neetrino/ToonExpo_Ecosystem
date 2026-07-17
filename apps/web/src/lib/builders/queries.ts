import {
  publicBuilderDetailSchema,
  publicBuilderSummarySchema,
  type PublicBuilderDetail,
  type PublicBuilderSummary,
} from '@toonexpo/contracts';
import { z } from 'zod';

import { apiRequest, ApiClientError } from '@/lib/api';

/** Loads public builders from Nest. */
export async function getPublicBuilders(): Promise<PublicBuilderSummary[]> {
  const raw = await apiRequest<unknown>('/catalog/builders');
  return z.array(publicBuilderSummarySchema).parse(raw);
}

/** Loads a public builder from Nest, or null when it does not exist. */
export async function getPublicBuilderBySlug(slug: string): Promise<PublicBuilderDetail | null> {
  try {
    const raw = await apiRequest<unknown>(`/catalog/builders/${encodeURIComponent(slug)}`);
    return publicBuilderDetailSchema.parse(raw);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
