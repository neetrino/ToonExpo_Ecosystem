import {
  publicProjectDetailSchema,
  publicProjectSummarySchema,
  type PublicProjectDetail,
  type PublicProjectSummary,
} from '@toonexpo/contracts';
import { z } from 'zod';

import { apiRequest, ApiClientError } from '@/lib/api';

import type { PublishedProjectFilters } from './project-filters';

const publishedProjectLoadSchema = z.object({
  project: publicProjectDetailSchema,
  companyId: z.string(),
});

export type PublishedProjectLoad = {
  project: PublicProjectDetail;
  companyId: string;
};

/** Loads published projects from Nest, preserving optional city/builder filters. */
export async function getPublishedProjects(
  filters?: PublishedProjectFilters,
): Promise<PublicProjectSummary[]> {
  const search = new URLSearchParams();
  if (filters?.city) {
    search.set('city', filters.city);
  }
  if (filters?.builderSlug) {
    search.set('builder', filters.builderSlug);
  }
  const suffix = search.size > 0 ? `?${search.toString()}` : '';
  const raw = await apiRequest<unknown>(`/catalog/projects${suffix}`);
  return z.array(publicProjectSummarySchema).parse(raw);
}

/** Loads a published project from Nest; forwards a session cookie for protected prices. */
export async function getPublishedProjectBySlug(
  companySlug: string,
  projectSlug: string,
  cookie?: string,
): Promise<PublishedProjectLoad | null> {
  try {
    const raw = await apiRequest<unknown>(
      `/catalog/projects/${encodeURIComponent(companySlug)}/${encodeURIComponent(projectSlug)}`,
      { cookie },
    );
    return publishedProjectLoadSchema.parse(raw);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export { getPublishedApartment, isValidApartmentId } from './published-apartment-query';
